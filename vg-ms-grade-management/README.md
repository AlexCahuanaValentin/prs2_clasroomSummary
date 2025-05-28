# Microservicio de Gestión de Logs de Calificaciones (vg-ms-grade-management)

Este microservicio está diseñado para registrar y consultar los cambios realizados en las calificaciones de los estudiantes. Utiliza una arquitectura hexagonal, programación reactiva con Spring WebFlux y MongoDB como base de datos.

## Tecnologías Utilizadas

- Java 17
- Spring Boot 3.x
- Spring WebFlux (para programación reactiva)
- Spring Data MongoDB Reactive
- Lombok
- Maven (para la gestión de dependencias)
- MongoDB

## Arquitectura Hexagonal

El proyecto sigue los principios de la arquitectura hexagonal (también conocida como Puertos y Adaptadores) para separar las preocupaciones y mejorar la mantenibilidad y testeabilidad del código.

- **Dominio (`domain`):** Contiene la lógica de negocio central y los modelos de entidad (POJOs).
    - `model`: Clases que representan las entidades del dominio como `GradeManagementLog`, `ModifiedData`, `ModifiedField`, `ContextMetadata`.
    - `repository`: Interfaces que definen las operaciones de persistencia para las entidades del dominio (ej. `GradeManagementLogRepository`).
- **Aplicación (`application`):** Orquesta los casos de uso y la lógica de la aplicación.
    - `service`: Interfaces que definen los servicios de la aplicación (ej. `GradeManagementLogService`).
    - `service/impl`: Implementaciones de los servicios de la aplicación (ej. `GradeManagementLogServiceImpl`).
- **Infraestructura (`infrastructure`):** Contiene los adaptadores para tecnologías externas.
    - `adapter/rest`: Controladores REST que exponen la API (ej. `GradeManagementLogController`).
    - La configuración de la base de datos (MongoDB) se gestiona a través de `application.yml` y Spring Data MongoDB Reactive.

## Estructura del Proyecto

```
.vg-ms-grade-management
├── pom.xml
├── README.md
└── src
    ├── main
    │   ├── java
    │   │   └── pe
    │   │       └── edu
    │   │           └── vallegrande
    │   │               └── vg_ms_grade_management
    │   │                   ├── VgMsGradeManagementApplication.java  (Clase principal de Spring Boot)
    │   │                   ├── application
    │   │                   │   ├── service
    │   │                   │   │   ├── GradeManagementLogService.java
    │   │                   │   │   └── impl
    │   │                   │   │       └── GradeManagementLogServiceImpl.java
    │   │                   ├── domain
    │   │                   │   ├── model
    │   │                   │   │   ├── ContextMetadata.java
    │   │                   │   │   ├── GradeManagementLog.java
    │   │                   │   │   ├── ModifiedData.java
    │   │                   │   │   └── ModifiedField.java
    │   │                   │   └── repository
    │   │                   │       └── GradeManagementLogRepository.java
    │   │                   └── infrastructure
    │   │                       └── adapter
    │   │                           └── rest
    │   │                               └── GradeManagementLogController.java
    │   └── resources
    │       └── application.yml (Configuración de la aplicación y MongoDB)
    └── test
        └── java
            └── pe
                └── edu
                    └── vallegrande
                        └── vg_ms_grade_management
                            └── VgMsGradeManagementApplicationTests.java
```

## Configuración

1.  **MongoDB:**
    Asegúrate de tener una instancia de MongoDB corriendo.
    La configuración de la conexión se encuentra en `src/main/resources/application.yml`.
    Por defecto, se conecta a `mongodb+srv://cristopherguzman:orTIWL10NmFAo3S5@cluster0.o8sc9.mongodb.net/AS231S5_PRS2?retryWrites=true&w=majority&appName=Cluster0` y utiliza la base de datos `AS231S5_PRS2`.

    ```yaml
    spring:
      application:
        name: vg-ms-grade-management
      data:
        mongodb:
          uri: mongodb+srv://cristopherguzman:orTIWL10NmFAo3S5@cluster0.o8sc9.mongodb.net/AS231S5_PRS2?retryWrites=true&w=majority&appName=Cluster0
          database: AS231S5_PRS2
          # Si tienes credenciales diferentes para esta URI, configúralas aquí:
          # username: tu_usuario
          # password: tu_contraseña
          # authentication-database: admin
    ```
    Puedes modificar el URI de conexión según tu configuración de MongoDB. Si tu base de datos requiere autenticación, asegúrate de que las credenciales estén incluidas en el URI o configura las propiedades `spring.data.mongodb.username`, `spring.data.mongodb.password`, y `spring.data.mongodb.authentication-database`.

## Cómo Ejecutar

1.  **Clonar el repositorio (si aplica).**
2.  **Asegurarse de que MongoDB esté en ejecución y accesible.**
3.  **Construir el proyecto usando Maven:**
    ```bash
    mvn clean install
    ```
4.  **Ejecutar la aplicación:**
    Puedes ejecutar la aplicación desde tu IDE (ej. IntelliJ IDEA, Eclipse) importando el proyecto Maven y ejecutando la clase `VgMsGradeManagementApplication.java`.
    O bien, puedes ejecutar el archivo JAR generado (después de `mvn clean install`):
    ```bash
    java -jar target/vg-ms-grade-management-0.0.1-SNAPSHOT.jar
    ```
    Por defecto, el microservicio se iniciará en el puerto `8080` (configurable en `application.yml` con `server.port`).

## Endpoints de la API

La API se expone bajo el path base `/grade-logs`.

### `POST /grade-logs`

Crea un nuevo registro de log de calificación.

-   **Request Body:** `GradeManagementLog` (JSON)
    ```json
    {
        "gradeId": 456,
        "studentId": 1,
        "teacherCoursesClassroom": 1,
        "periodId": 1,
        "actionType": "ACTUALIZACIÓN",
        "modifiedData": {
            "previousGrade": 16.00,
            "newGrade": 16.50,
            "modifiedFields": [
                {
                    "field": "participación",
                    "oldValue": 18.00,
                    "newValue": 18.50,
                    "impact": "Aumento del 2.78% en evaluación continua"
                },
                {
                    "field": "feedback",
                    "oldValue": "Reforzar multiplicación",
                    "newValue": "Dominio de multiplicación básica",
                    "impact": "Mejora en objetivos de aprendizaje MEP-2025"
                }
            ],
            "contextMetadata": {
                "curricularComponent": "Matemáticas",
                "learningUnit": "Operaciones básicas",
                "evaluationCriteria": "R.M.2.1.1"
            }
        },
        "changeReason": "Revisión de criterios de evaluación participativa (Orden Directiva 045-2025-MINEDU)",
        "modifiedBy": 3
    }
    ```
-   **Response:** `201 Created` con el `GradeManagementLog` creado (incluyendo el `id` generado por MongoDB y `modifiedAt`).

### `GET /grade-logs`

Obtiene todos los registros de log de calificaciones.

-   **Response:** `200 OK` con un array de `GradeManagementLog`.

### `GET /grade-logs/{id}`

Obtiene un registro de log de calificación por su ID (el `id` generado por MongoDB).

-   **Path Variable:** `id` (String) - El ID del log.
-   **Response:**
    -   `200 OK` con el `GradeManagementLog` encontrado.
    -   `404 Not Found` si el log no existe.

### `GET /grade-logs/student/{studentId}`

Obtiene todos los registros de log para un estudiante específico.

-   **Path Variable:** `studentId` (Long) - El ID del estudiante.
-   **Response:** `200 OK` con un array de `GradeManagementLog`.

### `GET /grade-logs/grade/{gradeId}`

Obtiene todos los registros de log para una calificación específica.

-   **Path Variable:** `gradeId` (Long) - El ID de la calificación.
-   **Response:** `200 OK` con un array de `GradeManagementLog`.

### `GET /grade-logs/period/{periodId}`

Obtiene todos los registros de log para un período académico específico.

-   **Path Variable:** `periodId` (Long) - El ID del período.
-   **Response:** `200 OK` con un array de `GradeManagementLog`.

### `GET /grade-logs/teacher-courses-classroom/{teacherCoursesClassroom}`

Obtiene todos los registros de log para una combinación específica de profesor, curso y aula.

-   **Path Variable:** `teacherCoursesClassroom` (Long) - El ID de la combinación.
-   **Response:** `200 OK` con un array de `GradeManagementLog`.

### `DELETE /grade-logs/{id}`

Elimina un registro de log de calificación por su ID.

-   **Path Variable:** `id` (String) - El ID del log a eliminar.
-   **Response:**
    -   `204 No Content` si la eliminación es exitosa.
    -   `404 Not Found` si el log no existe.

## Ejemplo de Modelo de Datos (`GradeManagementLog`)

La estructura principal de los datos almacenados es la siguiente:

-   `id` (String, generado por MongoDB): Identificador único del log.
-   `gradeId` (Long): ID de la calificación afectada.
-   `studentId` (Long): ID del estudiante.
-   `teacherCoursesClassroom` (Long): ID de la combinación profesor-curso-aula.
-   `periodId` (Long): ID del período académico.
-   `actionType` (String): Tipo de acción (ej. "CREACIÓN", "ACTUALIZACIÓN", "ELIMINACIÓN").
-   `modifiedData` (Object): Objeto que contiene los detalles de la modificación.
    -   `previousGrade` (Double): Calificación anterior (si aplica).
    -   `newGrade` (Double): Nueva calificación (si aplica).
    -   `modifiedFields` (List<Object>): Lista de campos específicos modificados.
        -   `field` (String): Nombre del campo.
        -   `oldValue` (Object): Valor anterior.
        -   `newValue` (Object): Nuevo valor.
        -   `impact` (String): Descripción del impacto del cambio.
    -   `contextMetadata` (Object): Metadatos del contexto de la modificación.
        -   `curricularComponent` (String): Componente curricular.
        -   `learningUnit` (String): Unidad de aprendizaje.
        -   `evaluationCriteria` (String): Criterio de evaluación.
-   `changeReason` (String): Razón del cambio.
-   `modifiedBy` (Long): ID del usuario que realizó la modificación.
-   `modifiedAt` (LocalDateTime): Fecha y hora de la modificación (generada automáticamente).

## Consideraciones Adicionales

-   **Manejo de Errores:** El controlador implementa un manejo básico de errores (ej. 404 Not Found). Se podría extender con un `ControllerAdvice` global para un manejo más robusto.
-   **Seguridad:** No se ha implementado seguridad en esta versión. Para un entorno de producción, se deberían añadir mecanismos de autenticación y autorización (ej. Spring Security con JWT).
-   **Validación:** Se podrían añadir validaciones a los datos de entrada utilizando Bean Validation (`javax.validation` o `jakarta.validation`).
-   **Pruebas:** Se recomienda añadir pruebas unitarias y de integración para asegurar la calidad del código.