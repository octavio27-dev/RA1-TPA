# Sistema de Gestión de Reservas de Canchas Sintéticas - "Golazo FC"

## Datos Académicos
* **Institución:** Universidad Señor de Sipán
* **Facultad:** Facultad de Ingeniería, Arquitectura y Urbanismo
* **Escuela:** Escuela Profesional de Ingeniería de Sistemas e Informática
* **Curso:** Taller de Programación de Aplicaciones
* **Ciclo:** IV
* **Docente:** Arcila Diaz Juan Carlos

---

## Integrantes del Equipo y Roles
* **Ramos Altamirano Kiara Zussety Paola** — Rol: Frontend
* **Suarez Kong José D'Alessandro** — Rol: Interacción / JS Cliente 
* **Vasquez Portal Junior Willy** — Rol: Backend con Node.js 
* **Delgado Vidarte Lesly Anahí** — Rol: Analista de requisitos y diagramas 
* **Chicoma Castillo Manuel Octavio** — Rol: Arquitectura y modelado UML 

## Descripción del Proyecto
Aplicación web multiplataforma desarrollada para optimizar el alquiler de campos deportivos y la atención de turnos en el complejo deportivo "Golazo FC". El sistema soluciona el cruce y la duplicidad de horarios mediante una arquitectura en tres capas y el uso de estructuras de datos en memoria (**Colas FIFO** y **Pilas LIFO**), sin requerir motores de bases de datos externas en esta etapa formativa.

## Tecnologías Utilizadas
* **Capa de Presentación:** HTML5, CSS3, JavaScript nativo
* **Capa Lógica / Negocio:** Node.js, Express
* **Capa de Datos:** Estructuras de datos en memoria (Clases `Cola` y `Pila`, arreglos de objetos)
* **Control de Versiones y Gestión Ágil:** Git, GitHub y GitHub Projects (Tablero Kanban)

## Implementación de Estructuras de Datos

* **Cola (FIFO - First In, First Out):**
  * **Uso:** Gestión de la lista de espera de turnos.
  * **Funcionamiento:** Si un usuario solicita un horario que ya está reservado, el sistema lo encola automáticamente con estado `"en espera"`. Al momento en que la reserva activa se cancela, se desencola al primer cliente de la lista y se le asigna el turno de forma automática.
  * **Métodos clave:** `encolar()`, `desencolar()`, `buscarYSacar()`.

* **Pila (LIFO - Last In, First Out):**
  * **Uso:** Auditoría y trazabilidad de eventos operativos.
  * **Funcionamiento:** Cada abono o confirmación se apila en la cima del historial. Permite consultar la última operación ejecutada y desapilar para revertir o deshacer acciones recientes.
  * **Métodos clave:** `apilar()`, `desapilar()`.

## Estructura del Repositorio

```text
reservas-cancha/
├── docs/                           # Documentación técnica, diagramas y requisitos
│   ├── historias-y-requisitos.md
│   └── diagramas/
├── public/                         # Capa de Presentación (Frontend)
│   ├── index.html                  # Formularios y tablas de reservas
│   ├── style.css                   # Diseño visual responsivo
│   └── app.js                      # Validaciones de usuario y peticiones fetch
├── .gitignore                      # Exclusión de la carpeta node_modules
├── package.json                    # Configuración y dependencias del proyecto
├── README.md                       # Manual técnico del repositorio
└── server.js                       # Servidor Node.js, rutas y estructuras de datos
