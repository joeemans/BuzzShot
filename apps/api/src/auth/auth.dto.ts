import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(24)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only include letters, numbers, and underscores.',
  })
  username!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  displayName!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(128)
  @Matches(/[a-z]/, { message: 'Password needs a lowercase letter.' })
  @Matches(/[A-Z]/, { message: 'Password needs an uppercase letter.' })
  @Matches(/[0-9]/, { message: 'Password needs a number.' })
  password!: string;
}

export class LoginDto {
  @IsString()
  @MinLength(3)
  @MaxLength(254)
  identifier!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(128)
  password!: string;
}
