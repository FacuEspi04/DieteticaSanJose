"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const child_process_1 = require("child_process");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        allowedHeaders: 'Content-Type, Accept',
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    await app.listen(3000, () => {
        console.log('Servidor iniciado en http://localhost:3000');
        const url = 'http://localhost:3000';
        if (process.platform === 'win32') {
            (0, child_process_1.exec)(`start ${url}`);
        }
    });
}
bootstrap();
//# sourceMappingURL=main.js.map