import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class RegisterEmployeeDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Role/Post is required' })
  role: string;

  @IsString()
  @Length(4, 4, { message: 'PIN must be exactly 4 digits' })
  @Matches(/^[0-9]+$/, { message: 'PIN must contain only numbers' })
  pin: string;
}