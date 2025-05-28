import { ClassroomGradeRecord } from './../types/classroomSummaryTypes';

const API_BASE = "http://localhost:8088/api/classroom-grade-records";

/**
 * Obtener resumen por ID
 */
export async function getClassroomSummaryById(id: string): Promise<ClassroomGradeRecord> {
    const res = await fetch(`${API_BASE}/${id}`);
    if (!res.ok) throw new Error("Resumen no encontrado");
    return await res.json();
}

/**
 * Buscar resúmenes por filtros (classroomId, periodId, status)
 */
export async function searchClassroomSummaries(
    classroomId?: number,
    periodId?: number,
    status?: string
): Promise<ClassroomGradeRecord[]> {
    const params = new URLSearchParams();
    if (classroomId !== undefined) params.append("classroomId", classroomId.toString());
    if (periodId !== undefined) params.append("periodId", periodId.toString());
    if (status) params.append("status", status);

    const res = await fetch(`${API_BASE}/search?${params.toString()}`);
    if (!res.ok) throw new Error("Error en la búsqueda");
    return await res.json();
}

/**
 * Verificar duplicado por aula y periodo
 */
export async function checkDuplicate(classroomId: number, periodId: number): Promise<boolean> {
    const params = new URLSearchParams({
        classroomId: classroomId.toString(),
        periodId: periodId.toString(),
    });

    const res = await fetch(`${API_BASE}/check-duplicate?${params.toString()}`);
    if (!res.ok) throw new Error("Error al verificar duplicado");

    const result = await res.json();
    return result === true;
}

/**
 * Crear resumen (genera a partir del microservicio de logs)
 */
export async function createClassroomSummary(data: {
    classroomId: number;
    periodId: number;
    createdBy: string;
    observation: string;
}): Promise<ClassroomGradeRecord> {
    const res = await fetch(`${API_BASE}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al crear el resumen");
    return await res.json();
}

/**
 * Actualizar resumen por ID
 */
export async function updateClassroomSummary(
    id: string,
    data: Partial<ClassroomGradeRecord>
): Promise<ClassroomGradeRecord> {
    const res = await fetch(`${API_BASE}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al actualizar");
    return await res.json();
}

/**
 * Eliminar resumen (eliminado físico)
 */
export async function deleteClassroomSummary(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Error al eliminar");
}

/**
 * Desactivar (eliminado lógico)
 */
export async function disableClassroomSummary(id: string): Promise<ClassroomGradeRecord> {
    const res = await fetch(`${API_BASE}/disable/${id}`, {
        method: "PUT",
    });
    if (!res.ok) throw new Error("Error al desactivar");
    return await res.json();
}

/**
 * Restaurar un resumen eliminado
 */
export async function restoreClassroomSummary(id: string): Promise<ClassroomGradeRecord> {
    const res = await fetch(`${API_BASE}/restore/${id}`, {
        method: "PUT",
    });
    if (!res.ok) throw new Error("Error al restaurar");
    return await res.json();
}
