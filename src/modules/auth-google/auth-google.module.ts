import { Module } from "@nestjs/common";
import { AuthModule } from "modules/auth/auth.module";
import { AuthGoogleService } from "./auth-google.service";
import { AuthGoogleController } from "./auth-google.controller";

@Module({
    imports: [AuthModule],
    providers: [AuthGoogleService],
    exports: [AuthGoogleService],
    controllers: [AuthGoogleController],
})

export class AuthGoogleModule { }