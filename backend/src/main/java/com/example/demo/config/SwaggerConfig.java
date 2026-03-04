package com.example.demo.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.media.Content;
import io.swagger.v3.oas.models.media.MediaType;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.responses.ApiResponse;
import io.swagger.v3.oas.models.responses.ApiResponses;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        Info info = new Info()
                .title("Antigravity API Docs")
                .description("Spring Boot + Next.js 통합 관리 시스템 API 명세서")
                .version("1.0.0");

        String jwtSchemeName = "BearerAuth";
        SecurityRequirement securityRequirement = new SecurityRequirement().addList(jwtSchemeName);

        Components components = new Components()
                .addSecuritySchemes(jwtSchemeName, new SecurityScheme()
                        .name(jwtSchemeName)
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT"));

        return new OpenAPI()
                .info(info)
                .addSecurityItem(securityRequirement)
                .components(components);
    }

    @Bean
    public OpenApiCustomizer globalExceptionCustomizer() {
        return openApi -> {
            Schema<?> errorResponseSchema = new Schema<>()
                    .type("object")
                    .name("ErrorResponse")
                    .addProperty("timestamp", new Schema<>().type("string").format("date-time"))
                    .addProperty("status", new Schema<>().type("integer").format("int32"))
                    .addProperty("error", new Schema<>().type("string"))
                    .addProperty("message", new Schema<>().type("string"))
                    .addProperty("path", new Schema<>().type("string"));

            openApi.getComponents().addSchemas("ErrorResponse", errorResponseSchema);

            ApiResponse badRequest = new ApiResponse().description("Bad Request / Validation Failed")
                    .content(new Content().addMediaType(org.springframework.http.MediaType.APPLICATION_JSON_VALUE, new MediaType().schema(new Schema<>().$ref("ErrorResponse"))));
            ApiResponse forbidden = new ApiResponse().description("Forbidden / Access Denied")
                    .content(new Content().addMediaType(org.springframework.http.MediaType.APPLICATION_JSON_VALUE, new MediaType().schema(new Schema<>().$ref("ErrorResponse"))));
            ApiResponse notFound = new ApiResponse().description("Resource Not Found")
                    .content(new Content().addMediaType(org.springframework.http.MediaType.APPLICATION_JSON_VALUE, new MediaType().schema(new Schema<>().$ref("ErrorResponse"))));
            ApiResponse internalError = new ApiResponse().description("Internal Server Error")
                    .content(new Content().addMediaType(org.springframework.http.MediaType.APPLICATION_JSON_VALUE, new MediaType().schema(new Schema<>().$ref("ErrorResponse"))));

            openApi.getPaths().values().forEach(pathItem -> pathItem.readOperations().forEach(operation -> {
                ApiResponses apiResponses = operation.getResponses();
                apiResponses.addApiResponse("400", badRequest);
                apiResponses.addApiResponse("403", forbidden);
                apiResponses.addApiResponse("404", notFound);
                apiResponses.addApiResponse("500", internalError);
            }));
        };
    }
}
