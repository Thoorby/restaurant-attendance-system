import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { EmployeesModule } from './employees/employees.module';
import { AttendanceModule } from './attendance/attendance.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [PrismaModule, EmployeesModule, AttendanceModule, ReportsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}