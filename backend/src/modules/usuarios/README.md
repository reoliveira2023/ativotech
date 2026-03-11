// ========== USUARIOS MODULE ==========
// usuarios.service.ts
import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

// This file is for documentation - see individual module files
