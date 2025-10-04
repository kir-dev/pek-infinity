import { NestFactory } from "@nestjs/core";
import {
	DocumentBuilder,
	SwaggerModule,
	type OpenAPIObject,
} from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { capitalize } from "./utils/capitalize";

export async function createApp() {
	const app = await NestFactory.create(AppModule);

	const config = new DocumentBuilder()
		.setTitle("PEK Infinity API")
		.setDescription("API for PEK Infinity project")
		.setVersion("1.0")
		.build();
	const document: OpenAPIObject = SwaggerModule.createDocument(app, config, {
		operationIdFactory: (controller, method, version) =>
			`${capitalize(controller.replace("Controller", ""))}${capitalize(method)}${version ?? ""}`,
	});
	SwaggerModule.setup("api", app, document);

	return { app, document };
}
