import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { BreakAttendanceDto } from './dto/break-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

// 1. ADD THIS NEW REGISTRATION METHOD
  async registerEmployee(dto: { name: string; role: string; pin: string }) {
    const existing = await this.prisma.employee.findUnique({
      where: { pin: dto.pin },
    });

    if (existing) {
      throw new BadRequestException('This 4-digit PIN is already assigned to another employee.');
    }

    return this.prisma.employee.create({
      data: {
        name: dto.name,
        role: dto.role,
        pin: dto.pin,
      },
    });
  }

  private async validateEmployee(pin: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { pin },
    });
    if (!employee || !employee.isActive) {
      throw new UnauthorizedException('Invalid PIN or inactive employee.');
    }
    return employee;
  }

  // 1. CLOCK IN
  async clockIn(createAttendanceDto: CreateAttendanceDto) {
    const employee = await this.validateEmployee(createAttendanceDto.pin);

    const activeShift = await this.prisma.shift.findFirst({
      where: {
        employeeId: employee.id,
        clockOut: null,
      },
    });

    if (activeShift) {
      throw new BadRequestException('Employee is already clocked in.');
    }

    return this.prisma.shift.create({
      data: {
        employeeId: employee.id,
        clockIn: new Date(),
      },
      include: { employee: { select: { name: true, role: true } } },
    });
  }

  // 2. CLOCK OUT
  async clockOut(createAttendanceDto: CreateAttendanceDto) {
    const employee = await this.validateEmployee(createAttendanceDto.pin);

    const activeShift = await this.prisma.shift.findFirst({
      where: {
        employeeId: employee.id,
        clockOut: null,
      },
      include: { breaks: true },
    });

    if (!activeShift) {
      throw new BadRequestException('No active shift found to clock out.');
    }

    const openBreak = activeShift.breaks.find((b) => b.endTime === null);
    if (openBreak) {
      await this.prisma.break.update({
        where: { id: openBreak.id },
        data: { endTime: new Date() },
      });
    }

    return this.prisma.shift.update({
      where: { id: activeShift.id },
      data: { clockOut: new Date() },
      include: { employee: { select: { name: true, role: true } }, breaks: true },
    });
  }

  // 3. START BREAK
  async startBreak(dto: BreakAttendanceDto) {
    const employee = await this.validateEmployee(dto.pin);

    const activeShift = await this.prisma.shift.findFirst({
      where: { employeeId: employee.id, clockOut: null },
      include: { breaks: true },
    });

    if (!activeShift) {
      throw new BadRequestException('Must be clocked in to start a break.');
    }

    const openBreak = activeShift.breaks.find((b) => b.endTime === null);
    if (openBreak) {
      throw new BadRequestException('Already on a break.');
    }

    return this.prisma.break.create({
      data: {
        shiftId: activeShift.id,
        startTime: new Date(),
      },
    });
  }

  // 4. END BREAK
  async endBreak(dto: BreakAttendanceDto) {
    const employee = await this.validateEmployee(dto.pin);

    const activeShift = await this.prisma.shift.findFirst({
      where: { employeeId: employee.id, clockOut: null },
      include: { breaks: true },
    });

    if (!activeShift) {
      throw new BadRequestException('No active shift found.');
    }

    const openBreak = activeShift.breaks.find((b) => b.endTime === null);
    if (!openBreak) {
      throw new BadRequestException('No active break found to end.');
    }

    return this.prisma.break.update({
      where: { id: openBreak.id },
      data: { endTime: new Date() },
    });
  }

  // 5. GET ACTIVE SHIFTS
  async getActiveShifts() {
    return this.prisma.shift.findMany({
      where: { clockOut: null },
      include: {
        employee: { select: { name: true, role: true } },
        breaks: true,
      },
    });
  }
}