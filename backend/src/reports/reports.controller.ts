import { Controller, Get, Query, Res } from '@nestjs/common';
import { ReportsService } from './reports.service';
import type { Response } from 'express';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('summary')
  getSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getSummary(startDate, endDate);
  }

  @Get('export')
  async exportCsv(
    @Res({ passthrough: true }) res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const summary = await this.reportsService.getSummary(startDate, endDate);

    let csvContent = 'Name,Post/Role,Time In,Lunch Start,Lunch Back,Time Out,Total Hours Worked\n';

    summary.forEach((row) => {
      csvContent += `"${row.name}","${row.role}","${row.timeIn}","${row.timeLunch}","${row.timeBack}","${row.timeOut}",${row.totalHoursWorked}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="attendance-report.csv"',
    );
    return csvContent;
  }
}