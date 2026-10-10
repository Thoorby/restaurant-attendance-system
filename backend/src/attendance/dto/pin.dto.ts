import { IsString, Length, Matches } from 'class-validator';

export class PinDto {
  @IsString()
  @Length(4, 4, { message: 'PIN must be exactly 4 digits' })
  @Matches(/^[0-9]+$/, { message: 'PIN must contain only numbers' })
  pin: string;
}