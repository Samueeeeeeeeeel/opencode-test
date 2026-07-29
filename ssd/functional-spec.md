# Aford — Especificaciones Funcionales

**Nombre del proyecto:** Aford
**Versión:** 1.0
**Fecha:** 22 de julio de 2026
**Plataforma:** Web app (PWA) — Next.js, Neon DB, Drizzle ORM
**Moneda:** CLP (Peso Chileno)
**Modelo de negocio:** Gratuito, sin monetización

---

## 1. Visión general

Aford es una aplicación web progresiva (PWA) de finanzas personales orientada a usuarios generales. Permite registrar ingresos, gastos, compras en cuotas, cuentas, transferencias, deudas y metas de ahorro, con sincronización en tiempo real entre dispositivos.

---

## 2. Autenticación y usuarios

### 2.1 Registro e inicio de sesión
- Registro con **email y contraseña**.
- Login con email y contraseña.
- Opción de **recordar sesión** (persistir token de sesión en el navegador).
- Múltiples sesiones simultáneas permitidas por usuario.

### 2.2 Perfil de usuario
- Nombre, email y **foto de perfil/avatar** (subida propia o selección de avatar predefinido).
- Edición de perfil desde configuración.

### 2.3 Onboarding
- **Tutorial guiado** al primer inicio de sesión:
  1. Selección de moneda (CLP por defecto).
  2. Creación de cuentas iniciales (ej: Banco, Efectivo).
  3. Creación de categorías base (el usuario elige o crea las suyas).
  4. Configuración de día de cierre de mes.
- El usuario puede saltar el onboarding y configurar después.

---

## 3. Cuentas

### 3.1 Multi-cuentas
- El usuario puede crear múltiples cuentas: bancarias, billeteras de efectivo, tarjetas de crédito, etc.
- Cada cuenta tiene:
  - **Nombre** (ej: "BancoEstado", "Efectivo", "Tarjeta CMR").
  - **Tipo** (cuenta corriente, ahorro, efectivo, tarjeta de crédito).
  - **Saldo actual** (calculado automáticamente a partir de transacciones).
  - **Moneda** (CLP por defecto).
  - **Color** (personalizable).
  - **Icono** (opcional).

### 3.2 Saldos
- Los saldos se calculan automáticamente sumando ingresos y restando gastos.
- **No se permiten saldos negativos**: si un gasto superaría el saldo, se muestra un error impidiendo la operación.

### 3.3 Transferencias
- Registro de transferencias entre cuentas propias.
- La transferencia resta de la cuenta origen y suma en la cuenta destino.
- Registro del monto, fecha, cuentas origen/destino y opcionalmente una nota.

---

## 4. Categorías

### 4.1 Categorías personalizadas
- El usuario crea, edita y elimina sus propias categorías.
- Cada categoría tiene:
  - **Nombre** (ej: "Alimentación", "Transporte", "Salario").
  - **Tipo**: Ingreso o Gasto.
  - **Color** (personalizable por el usuario).
  - **Icono** (opcional).

### 4.2 Tags/Etiquetas
- Sistema de **tags** adicional a las categorías.
- El usuario crea tags libremente (ej: "Viaje", "Cumpleaños", "Trabajo").
- Cada transacción puede tener múltiples tags.
- Tags son independentes del tipo de categoría (ingreso o gasto).

---

## 5. Transacciones

### 5.1 Registro de ingresos y gastos
- Cada transacción tiene:
  - **Monto** (CLP).
  - **Fecha**.
  - **Tipo**: Ingreso o Gasto.
  - **Categoría** (obligatoria, una sola).
  - **Tags** (opcionales, múltiples).
  - **Cuenta asociada** (obligatoria).
  - **Nota/descripción libre** (opcional).
  - **Estado**: Confirmada o Pendiente.

### 5.2 Transacciones pendientes
- El usuario puede marcar una transacción como **pendiente** (ej: gasto con tarjeta que aún no se cobró).
- Las transacciones pendientes aparecen destacadas visualmente.
- El usuario puede confirmar o cancelar una transacción pendiente.
- Las transacciones pendientes **no afectan el saldo** de la cuenta hasta ser confirmadas.

### 5.3 Compras en cuotas
- Al registrar un gasto, el usuario puede indicar que es una **compra en cuotas**.
- Datos de la cuota:
  - **Monto total** de la compra.
  - **Número de cuotas** (ej: 3, 6, 12).
  - **Fecha de la primera cuota**.
  - **Cuenta asociada**.
  - **Categoría** y **tags**.
- La app **auto-distribuye** las cuotas en los meses correspondientes, creando una transacción pendiente por cuota en cada mes.
- Las cuotas futuras aparecen en el dashboard como compromisos próximos.

### 5.4 Gastos recurrentes
- Registro de gastos que se repiten periódicamente:
  - **Frecuencia**: Mensual, quincenal, semanal, anual.
  - **Monto**, **categoría**, **cuenta**, **tags**, **nota**.
  - **Fecha de inicio** y **fecha de fin** (o indefinido).
- La app genera automáticamente la transacción en cada período.

### 5.5 Ingresos recurrentes
- Mismo sistema que gastos recurrentes, pero para ingresos (salarios, alquiler cobrado, etc.).
- Se registran automáticamente en la fecha correspondiente.

### 5.6 Edición de transacciones
- Las transacciones **solo se pueden editar**, no borrar.
- El usuario puede modificar monto, fecha, categoría, cuenta, tags, nota y estado.
- Se mantiene un registro interno de la edición (audit trail básico).

### 5.7 Búsqueda
- **Búsqueda en tiempo real** mientras el usuario escribe.
- Se puede buscar por: nombre de categoría, tags, notas, monto.
- Los resultados aparecen instantáneamente.

### 5.8 Límites
- **Sin límite** de transacciones por mes o en total.

---

## 6. Dashboard

### 6.1 Vista principal
- **Resumen del mes actual**:
  - Saldo total (suma de todas las cuentas).
  - Total de ingresos del mes.
  - Total de gastos del mes.
  - Balance (ingresos - gastos).

### 6.2 Gráficas avanzadas
- **Gráfico de torta**: Distribución de gastos por categoría.
- **Gráfico de barras**: Ingresos vs gastos por mes (últimos 6-12 meses).
- **Gráfico de línea**: Tendencia del saldo a lo largo del tiempo.
- **Heatmap**: Calendario de gastos diarios (intensidad de color según monto).

### 6.3 Presupuestos por categoría
- El usuario establece un **límite de gasto mensual** por categoría.
- Se muestra una barra de progreso por categoría con:
  - Monto gastado / Monto del presupuesto.
  - Porcentaje consumido.
  - Color indicador: verde (< 70%), amarillo (70-90%), rojo (> 90%).
- Alerta visual cuando se supera el presupuesto.

### 6.4 Compromisos próximos
- Lista de cuotas pendientes y gastos recurrentes próximos (próximos 7-30 días).

---

## 7. Metas de ahorro

- El usuario crea **metas/objetivos de ahorro** con:
  - **Nombre** (ej: "Viaje a Europa", "Fondo de emergencia").
  - **Monto objetivo**.
  - **Monto actual** (acumulado).
  - **Fecha objetivo** (opcional).
  - **Cuenta asociada** (opcional).
  - **Color/icono** (opcional).
- Se muestra una **barra de progreso** por meta.
- El usuario puede **agregar fondos** a una meta manualmente o vincularla a una categoría de ahorro.
- La app calcula automáticamente cuánto necesita ahorrar por mes para cumplir la meta antes de la fecha objetivo.

---

## 8. Deudas y préstamos

- Registro de deudas pendientes (préstamos a terceros o propios):
  - **Nombre/descripción** (ej: "Préstamo a Juan", "Crédito hipotecario").
  - **Monto total**.
  - **Monto pagado**.
  - **Tasa de interés** (opcional).
  - **Fecha de inicio** y **fecha de vencimiento** (opcional).
  - **Persona/institución** asociada.
- Se muestra el **monto restante** y **progreso de pago**.
- Registro de **pagos parciales** sobre la deuda.

---

## 9. Reportes

### 9.1 Reporte mensual
- Resumen del mes con:
  - Total de ingresos y gastos.
  - Balance del mes.
  - Top categorías de gasto.
  - Comparativa con el mes anterior.

### 9.2 Reportes con filtros
- Filtros disponibles:
  - **Rango de fechas**.
  - **Categorías** (una o múltiples).
  - **Cuentas**.
  - **Tags**.
  - **Tipo** (solo ingresos, solo gastos, ambos).
- **Exportación a CSV y Excel**.

### 9.3 Gráficas en reportes
- Gráficas interactivas en los reportes:
  - Torta por categorías.
  - Barras por mes.
  - Línea de tendencia.
  - Comparativa entre períodos.

---

## 10. Configuración

### 10.1 General
- **Día de cierre de mes** personalizable (1-28).
- **Modo oscuro** (tema claro / tema oscuro).
- **Idioma**: Español (ES) e Inglés (EN), con cambio de idioma en settings.
- **Moneda**: CLP (fijo, sin cambio).

### 10.2 Notificaciones
- **Notificaciones push** para:
  - Recordatorios de registrar gastos.
  - Alertas de presupuesto (cercano al límite o superado).
  - Recordatorios de cuotas pendientes.
  - Metas de ahorro próximas a vencer.
- El usuario puede activar/desactivar cada tipo de notificación.

### 10.3 Perfil
- Edición de nombre, email, foto de perfil/avatar.
- Cambio de contraseña.

---

## 11. Comportamiento general

### 11.1 Sincronización
- **Sincronización en tiempo real** entre dispositivos.
- Los cambios realizados en un dispositivo se reflejan instantáneamente en los demás.
-冲突 de edición: si dos dispositivos editan la misma transacción simultáneamente, se muestra el último guardado con aviso.

### 11.2 Cálculo de saldos
- Los saldos de las cuentas se recalculan automáticamente al registrar, editar o confirmar una transacción.
- Las transacciones pendientes **no afectan** el saldo hasta ser confirmadas.

### 11.3 Calendario financiero
- El mes financiero se define por el **día de cierre** configurado por el usuario.
- Ejemplo: si el cierre es día 25, el "mes" va del 25 del mes anterior al 24 del mes actual.
- Todos los reportes, presupuestos y dashboard respetan este calendario.

### 11.4 Recurrencia
- Los gastos e ingresos recurrentes se generan automáticamente al inicio de cada período.
- El usuario recibe una notificación antes de que se genere la transacción recurrente.

---

## 12. Restricciones y reglas de negocio

| Regla | Descripción |
|-------|-------------|
| Sin saldos negativos | No se permite que una cuenta tenga saldo negativo. Si un gasto superaría el saldo, se rechaza la operación con un mensaje de error. |
| Solo edición | Las transacciones no se pueden borrar, solo editar. |
| Categoría obligatoria | Toda transacción debe tener una categoría asignada. |
| Cuenta obligatoria | Toda transacción debe estar asociada a una cuenta. |
| Cuotas mínimas | El número mínimo de cuotas es 2. |
| Día de cierre válido | El día de cierre debe estar entre 1 y 28. |
| Tags opcionales | Los tags son opcionales y el usuario puede no asignar ninguno. |
| Sin límite de transacciones | No hay restricción en la cantidad de transacciones. |

---

## 13. Flujos principales

### 13.1 Flujo de registro de un gasto simple
1. Usuario selecciona "Agregar gasto".
2. Ingresa monto, fecha y selecciona categoría.
3. Selecciona cuenta de origen.
4. Agrega tags (opcional) y nota (opcional).
5. Confirma → se descuenta del saldo de la cuenta.

### 13.2 Flujo de compra en cuotas
1. Usuario selecciona "Agregar gasto en cuotas".
2. Ingresa monto total y número de cuotas.
3. Selecciona fecha de la primera cuota, categoría, cuenta y tags.
4. La app calcula el valor de cada cuota (monto total / número de cuotas).
5. Se crean transacciones pendientes para cada cuota en los meses correspondientes.
6. Cada mes, al confirmar la cuota, se descuenta del saldo.

### 13.3 Flujo de meta de ahorro
1. Usuario crea una meta con nombre, monto objetivo y fecha.
2. La app calcula el ahorro mensual necesario.
3. El usuario agrega fondos manualmente o vincula una categoría de ahorro.
4. Se muestra progreso con barra visual.
5. Al llegar al monto objetivo, se marca como completada.

### 13.4 Flujo de transferencia entre cuentas
1. Usuario selecciona "Transferir".
2. Selecciona cuenta origen y cuenta destino.
3. Ingresa monto y fecha.
4. Confirma → se descuenta de origen y se suma en destino.

---

## 14. Pantallas principales

| Pantalla | Descripción |
|----------|-------------|
| Login / Registro | Formulario de autenticación con opción de recordar sesión. |
| Onboarding | Tutorial guiado de configuración inicial. |
| Dashboard | Resumen mensual, gráficas, presupuestos, compromisos próximos. |
| Transacciones | Lista de transacciones con búsqueda en tiempo real, filtros y paginación. |
| Agregar transacción | Formulario para registrar gasto/ingreso (simple o en cuotas). |
| Cuentas | Lista de cuentas con saldos y opción de agregar/editar. |
| Transferencias | Registro y historial de transferencias entre cuentas. |
| Categorías | CRUD de categorías con colores personalizados. |
| Tags | Gestión de tags/etiquetas. |
| Presupuestos | Configuración de presupuestos por categoría con barras de progreso. |
| Metas de ahorro | Creación y seguimiento de metas de ahorro. |
| Deudas | Registro y seguimiento de deudas/préstamos pendientes. |
| Reportes | Reportes mensuales con filtros, gráficas y exportación. |
| Configuración | Día de cierre, idioma, tema, notificaciones, perfil. |
| Perfil | Edición de datos personales, foto/avatar, contraseña. |

---

## 15. Stack tecnológico (referencia para spec técnica)

| Componente | Tecnología |
|------------|------------|
| Frontend | Next.js (App Router) |
| Base de datos | Neon (PostgreSQL serverless) |
| ORM | Drizzle |
| Estilo | TBD (definir en spec técnica) |
| Auth | TBD (definir en spec técnica) |
| Notificaciones push | TBD (definir en spec técnica) |
| Deploy | TBD (definir en spec técnica) |

---

*Documento generado para el proyecto Aford. Próximo paso: Especificaciones Técnicas.*
