import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();

    const shifts = await this.prisma.shift.findMany({
      where: {
        clockIn: {
          gte: start,
          lte: end,
        },
      },
      include: {
        employee: true,
        breaks: {
          orderBy: { startTime: 'asc' },
        },
      },
      orderBy: { clockIn: 'desc' },
    });

    const now = new Date();

    return shifts.map((shift) => {
      const formatTime = (date?: Date | null) =>
        date
          ? new Date(date).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })
          : '--:--';

      const lunchBreak = shift.breaks[0];

      // Calculate Duration (Real-time if still clocked in)
      const endTime = shift.clockOut ? new Date(shift.clockOut) : now;
      let totalMinutes = (endTime.getTime() - new Date(shift.clockIn).getTime()) / (1000 * 60);

      let breakMinutes = 0;
      shift.breaks.forEach((b) => {
        const bEnd = b.endTime ? new Date(b.endTime) : (b.startTime ? now : null);
        if (b.startTime && bEnd) {
          breakMinutes += (bEnd.getTime() - new Date(b.startTime).getTime()) / (1000 * 60);
        }
      });

      const netWorkedHours = +(Math.max(0, totalMinutes - breakMinutes) / 60).toFixed(2);

      return {
        id: shift.id,
        name: shift.employee.name,
        role: shift.employee.role,
        timeIn: formatTime(shift.clockIn),
        timeLunch: formatTime(lunchBreak?.startTime),
        timeBack: formatTime(lunchBreak?.endTime),
        timeOut: shift.clockOut ? formatTime(shift.clockOut) : 'Active',
        totalHoursWorked: netWorkedHours,
      };
    });
  }
}