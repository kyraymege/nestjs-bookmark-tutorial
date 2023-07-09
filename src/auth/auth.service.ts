import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from 'argon2';
import { ForbiddenException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService, private jwt: JwtService, private config: ConfigService) { }
    async signup(dto: AuthDto) {
        //Generate the password hash
        const hash = await argon.hash(dto.password);
        //Save the new user in the database
        try {
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    hash,
                },
                //prisma will return selected fields only
                // select:{
                //     id:true,
                //     email:true,
                //     createdAt:true,
                //     updatedAt:true,
                // }
            });

            return this.signToken(user.id, user.email);
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ForbiddenException(
                        'This Email is already taken.',
                    );
                }
            }
            throw error;
        }
    }

    async signin(dto: AuthDto) {
        //Find the user by email 
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email,
            },
        });

        //If the user does not exist throw an error
        if (!user) {
            throw new ForbiddenException('Email is not registered');
        }

        //Compare the password hash
        const valid = await argon.verify(user.hash, dto.password);

        //If the password is invalid throw an error
        if (!valid) {
            throw new ForbiddenException('Password is incorrect');
        }

        return this.signToken(user.id, user.email);
    }

    async signToken(userId: number, email: string): Promise<{ access_token: string }> {
        const payload = { email: email, sub: userId };
        const secret = this.config.get('JWT_SECRET');
        const token = await this.jwt.signAsync(payload, {
            expiresIn: '15m',
            secret: secret,
        });

        return {
            access_token: token,
        };
    }
}
