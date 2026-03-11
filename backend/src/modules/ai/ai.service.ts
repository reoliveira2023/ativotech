import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async chat(pergunta: string, empresaId: string) {
    // Get context data
    const [totalAtivos, ativosPorStatus, ativosPorCategoria, semResponsavel, ativos5anos] =
      await Promise.all([
        this.prisma.ativo.count({ where: { empresaId } }),
        this.prisma.ativo.groupBy({ by: ['status'], where: { empresaId }, _count: { id: true } }),
        this.prisma.ativo.groupBy({
          by: ['categoriaId'],
          where: { empresaId },
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
        }),
        this.prisma.ativo.count({ where: { empresaId, responsavelId: null } }),
        this.prisma.ativo.count({
          where: {
            empresaId,
            dataCompra: { lte: new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000) },
          },
        }),
      ]);

    const categoriaIds = ativosPorCategoria.map((c) => c.categoriaId).filter(Boolean);
    const categorias = await this.prisma.categoria.findMany({
      where: { id: { in: categoriaIds } },
    });

    const ativosPorDepto = await this.prisma.ativo.groupBy({
      by: ['departamentoId'],
      where: { empresaId },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    const deptoIds = ativosPorDepto.map((d) => d.departamentoId).filter(Boolean);
    const departamentos = await this.prisma.departamento.findMany({
      where: { id: { in: deptoIds } },
    });

    const statusMap = {};
    ativosPorStatus.forEach((s) => { statusMap[s.status] = s._count.id; });

    const categoriasMap = ativosPorCategoria.map((c) => ({
      nome: categorias.find((cat) => cat.id === c.categoriaId)?.nome || 'Sem categoria',
      total: c._count.id,
    }));

    const deptosMap = ativosPorDepto.map((d) => ({
      nome: departamentos.find((dep) => dep.id === d.departamentoId)?.nome || 'Sem departamento',
      total: d._count.id,
    }));

    const contexto = `
Você é um assistente de gestão de ativos de TI. Use os dados abaixo para responder perguntas:

DADOS ATUAIS:
- Total de ativos: ${totalAtivos}
- Ativos por status: ${JSON.stringify(statusMap)}
- Ativos por categoria: ${JSON.stringify(categoriasMap)}
- Ativos por departamento: ${JSON.stringify(deptosMap)}
- Ativos sem responsável: ${semResponsavel}
- Ativos com mais de 5 anos: ${ativos5anos}

Responda de forma clara, direta e em português. Use os dados fornecidos.
Se não souber algo específico que os dados não cobrem, diga que precisaria de mais detalhes.
`;

    const apiKey = this.config.get('OPENAI_API_KEY');

    // If no real API key, use mock response
    if (!apiKey || apiKey === 'sk-demo') {
      return this.mockResponse(pergunta, {
        totalAtivos, statusMap, categoriasMap, deptosMap, semResponsavel, ativos5anos,
      });
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: contexto },
            { role: 'user', content: pergunta },
          ],
          max_tokens: 500,
        }),
      });

      const data = await response.json();
      return { resposta: data.choices[0]?.message?.content || 'Não foi possível obter resposta.' };
    } catch (e) {
      return this.mockResponse(pergunta, {
        totalAtivos, statusMap, categoriasMap, deptosMap, semResponsavel, ativos5anos,
      });
    }
  }

  private mockResponse(pergunta: string, dados: any) {
    const p = pergunta.toLowerCase();

    if (p.includes('total') || p.includes('quantos ativos')) {
      return { resposta: `Há um total de **${dados.totalAtivos} ativos** cadastrados no sistema.` };
    }
    if (p.includes('sem responsável') || p.includes('responsavel')) {
      return { resposta: `Existem **${dados.semResponsavel} ativos sem responsável** definido. Recomendo fazer uma revisão e atribuir responsáveis a esses ativos.` };
    }
    if (p.includes('5 anos') || p.includes('antigos')) {
      return { resposta: `Há **${dados.ativos5anos} ativos** com mais de 5 anos de uso. Considere avaliar a necessidade de substituição.` };
    }
    if (p.includes('departamento') || p.includes('setor')) {
      const top = dados.deptosMap[0];
      return { resposta: `O departamento com mais ativos é **${top?.nome || 'N/A'}** com **${top?.total || 0} ativos**. Distribuição completa: ${JSON.stringify(dados.deptosMap)}` };
    }
    if (p.includes('categoria') || p.includes('tipo')) {
      const top = dados.categoriasMap[0];
      return { resposta: `A categoria mais comum é **${top?.nome || 'N/A'}** com **${top?.total || 0} ativos**. Distribuição: ${JSON.stringify(dados.categoriasMap)}` };
    }
    if (p.includes('status') || p.includes('disponível') || p.includes('uso')) {
      return { resposta: `Status dos ativos: Em uso: ${dados.statusMap['EM_USO'] || 0}, Disponíveis: ${dados.statusMap['DISPONIVEL'] || 0}, Manutenção: ${dados.statusMap['MANUTENCAO'] || 0}, Estoque: ${dados.statusMap['ESTOQUE'] || 0}` };
    }

    return {
      resposta: `Tenho acesso aos seguintes dados: **${dados.totalAtivos} ativos** no total, **${dados.semResponsavel} sem responsável**, **${dados.ativos5anos} com mais de 5 anos**. Para análises mais específicas, configure uma chave de API OpenAI nas variáveis de ambiente.`,
    };
  }
}
