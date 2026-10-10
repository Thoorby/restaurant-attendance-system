import { Controller, Post, Get, Body } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { BreakAttendanceDto } from './dto/break-attendance.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('clock-in')
  clockIn(@Body() dto: CreateAttendanceDto) {
    return this.attendanceService.clockIn(dto);
  }

  @Post('clock-out')
  clockOut(@Body() dto: CreateAttendanceDto) {
    return this.attendanceService.clockOut(dto);
  }

  @Post('break/start')
  startBreak(@Body() dto: BreakAttendanceDto) {
    return this.attendanceService.startBreak(dto);
  }

  @Post('break/end')
  endBreak(@Body() dto: BreakAttendanceDto) {
    return this.attendanceService.endBreak(dto);
  }

  @Get('active')
  getActiveShifts() {
    return this.attendanceService.getActiveShifts();
  }
}