"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ClassroomGradeRecord } from "./types/classroomSummaryTypes"
import { checkDuplicate } from "./services/classroomSummaryService"
import Swal from "sweetalert2"

interface ModalProps {
    isOpen: boolean
    isEdit: boolean
    data?: ClassroomGradeRecord | null
    onClose: () => void
    onSave: (data: any) => void
    classrooms: Array<{ id: number; name: string }>
    periods: Array<{ id: number; name: string }>
}

export default function Modal({ isOpen, isEdit, data, onClose, onSave, classrooms, periods }: ModalProps) {
    const [formData, setFormData] = useState({
        classroomId: "",
        periodId: "",
        createdBy: "",
        observation: "",
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(false)
    const [duplicateError, setDuplicateError] = useState(false)
    const [checkingDuplicate, setCheckingDuplicate] = useState(false)

    useEffect(() => {
        if (isOpen) {
            if (isEdit && data) {
                setFormData({
                    classroomId: data.classroomId.toString(),
                    periodId: data.periodId.toString(),
                    createdBy: data.createdBy,
                    observation: data.observation,
                })
            } else {
                setFormData({
                    classroomId: "",
                    periodId: "",
                    createdBy: "",
                    observation: "",
                })
            }
            setErrors({})
            setDuplicateError(false)
        }
    }, [isOpen, isEdit, data])

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.classroomId) {
            newErrors.classroomId = "Selecciona un aula"
        }
        if (!formData.periodId) {
            newErrors.periodId = "Selecciona un período"
        }
        if (!formData.createdBy.trim()) {
            newErrors.createdBy = "Ingresa el nombre del creador"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const checkForDuplicate = async () => {
        if (!formData.classroomId || !formData.periodId) return

        // Si estamos editando y los valores no han cambiado, no verificar duplicado
        if (
            isEdit &&
            data &&
            data.classroomId.toString() === formData.classroomId &&
            data.periodId.toString() === formData.periodId
        ) {
            setDuplicateError(false)
            return
        }

        try {
            setCheckingDuplicate(true)
            const isDuplicate = await checkDuplicate(
                Number.parseInt(formData.classroomId),
                Number.parseInt(formData.periodId),
            )
            setDuplicateError(isDuplicate)
        } catch (error) {
            console.error("Error checking duplicate:", error)
            setDuplicateError(false)
        } finally {
            setCheckingDuplicate(false)
        }
    }

    useEffect(() => {
        if (formData.classroomId && formData.periodId) {
            checkForDuplicate()
        } else {
            setDuplicateError(false)
        }
    }, [formData.classroomId, formData.periodId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        // Bloquear si hay duplicado
        if (duplicateError) {
            Swal.fire({
                icon: "error",
                title: "No se puede crear",
                text: "Ya existe un resumen para esta aula y período. Por favor selecciona una combinación diferente.",
                confirmButtonColor: "#ef4444",
            })
            return
        }

        setLoading(true)

        try {
            const submitData = {
                ...formData,
                classroomId: Number.parseInt(formData.classroomId),
                periodId: Number.parseInt(formData.periodId),
            }

            await onSave(submitData)
        } catch (error) {
            console.error("Error saving:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }))
        }
    }

    const getClassroomName = (id: string) => {
        return classrooms.find((c) => c.id.toString() === id)?.name || ""
    }

    const getPeriodName = (id: string) => {
        return periods.find((p) => p.id.toString() === id)?.name || ""
    }

    // Verificar si el botón de guardar debe estar deshabilitado
    const isSubmitDisabled = loading || duplicateError || checkingDuplicate

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Save className="h-5 w-5 text-blue-600" />
                        </div>
                        {isEdit ? "Editar Resumen de Aula" : "Crear Nuevo Resumen"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Información del resumen */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Información del Resumen</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="classroomId" className="text-sm font-medium">
                                    Aula <span className="text-red-500">*</span>
                                </Label>
                                <Select value={formData.classroomId} onValueChange={(value) => handleInputChange("classroomId", value)}>
                                    <SelectTrigger className={errors.classroomId ? "border-red-500" : ""}>
                                        <SelectValue placeholder="Selecciona un aula" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classrooms.map((classroom) => (
                                            <SelectItem key={classroom.id} value={classroom.id.toString()}>
                                                {classroom.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.classroomId && <p className="text-sm text-red-500">{errors.classroomId}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="periodId" className="text-sm font-medium">
                                    Período <span className="text-red-500">*</span>
                                </Label>
                                <Select value={formData.periodId} onValueChange={(value) => handleInputChange("periodId", value)}>
                                    <SelectTrigger className={errors.periodId ? "border-red-500" : ""}>
                                        <SelectValue placeholder="Selecciona un período" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {periods.map((period) => (
                                            <SelectItem key={period.id} value={period.id.toString()}>
                                                {period.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.periodId && <p className="text-sm text-red-500">{errors.periodId}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="createdBy" className="text-sm font-medium">
                                Creado por <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="createdBy"
                                value={formData.createdBy}
                                onChange={(e) => handleInputChange("createdBy", e.target.value)}
                                placeholder="Nombre del usuario que crea el resumen"
                                className={errors.createdBy ? "border-red-500" : ""}
                            />
                            {errors.createdBy && <p className="text-sm text-red-500">{errors.createdBy}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="observation" className="text-sm font-medium">
                                Observación
                            </Label>
                            <Textarea
                                id="observation"
                                value={formData.observation}
                                onChange={(e) => handleInputChange("observation", e.target.value)}
                                placeholder="Describe las observaciones del resumen (opcional)..."
                                rows={4}
                                className={errors.observation ? "border-red-500" : ""}
                            />
                            {errors.observation && <p className="text-sm text-red-500">{errors.observation}</p>}
                        </div>
                    </div>

                    {/* Estado de verificación de duplicado */}
                    {checkingDuplicate && (
                        <Alert className="border-blue-200 bg-blue-50">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <AlertDescription className="text-blue-800">
                                Verificando si ya existe un resumen para esta combinación...
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Error de duplicado */}
                    {duplicateError && (
                        <Alert className="border-red-200 bg-red-50">
                            <X className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-800">
                                <strong>Error:</strong> Ya existe un resumen para el aula "{getClassroomName(formData.classroomId)}" en
                                el período "{getPeriodName(formData.periodId)}". Por favor selecciona una combinación diferente.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Vista previa de datos */}
                    {isEdit && data && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Datos Actuales</h3>

                            {/* Resumen de calificaciones */}
                            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                                <h4 className="font-medium text-gray-800">Resumen de Calificaciones</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-600">Total Estudiantes:</span>
                                        <span className="ml-2 text-gray-900">{data.gradeSummary.totalStudents}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">Promedio:</span>
                                        <span className="ml-2 text-gray-900">{data.gradeSummary.averageGrade.toFixed(1)}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">Mejor Nota:</span>
                                        <span className="ml-2 text-gray-900">{data.gradeSummary.topPerformance}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">Menor Nota:</span>
                                        <span className="ml-2 text-gray-900">{data.gradeSummary.lowestPerformance}</span>
                                    </div>
                                </div>
                                <div className="text-sm">
                                    <span className="font-medium text-gray-600">Estado:</span>
                                    <span
                                        className={`ml-2 px-2 py-1 rounded text-xs ${data.status === "A" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                                    >
                                        {data.status === "A" ? "Activo" : "Inactivo"}
                                    </span>
                                </div>
                            </div>

                            {/* Análisis de competencias */}
                            {data.competencyStats.competencyAnalysis.length > 0 && (
                                <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                                    <h4 className="font-medium text-blue-800">Análisis de Competencias</h4>
                                    <div className="space-y-2">
                                        {data.competencyStats.competencyAnalysis.map((competency, index) => (
                                            <div key={index} className="flex justify-between items-center bg-white p-3 rounded border">
                                                <span className="font-medium text-gray-700">{competency.name}</span>
                                                <div className="text-right">
                                                    <span className="text-lg font-bold text-blue-600">
                                                        {competency.classroomAverage.toFixed(1)}
                                                    </span>
                                                    <p className="text-xs text-gray-500">Promedio del aula</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Áreas de mejora */}
                            {data.competencyStats.improvementAreas.length > 0 && (
                                <div className="bg-red-50 p-4 rounded-lg space-y-3">
                                    <h4 className="font-medium text-red-800">Áreas de Mejora</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {data.competencyStats.improvementAreas.map((area, index) => (
                                            <div key={index} className="bg-white px-3 py-2 rounded border border-red-200">
                                                <span className="text-red-700 font-medium">{area}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-sm text-red-600">
                                        Estas competencias requieren atención especial para mejorar el rendimiento del aula.
                                    </p>
                                </div>
                            )}

                            {/* Información adicional */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium text-gray-800 mb-2">Información Adicional</h4>
                                <div className="text-sm space-y-1">
                                    <p>
                                        <span className="font-medium text-gray-600">Creado:</span>{" "}
                                        {new Date(data.createdAt).toLocaleString()}
                                    </p>
                                    <p>
                                        <span className="font-medium text-gray-600">Creado por:</span> {data.createdBy}
                                    </p>
                                    <p>
                                        <span className="font-medium text-gray-600">ID:</span> {data.id}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Botones de acción */}
                    <div className="flex justify-end gap-3 pt-6 border-t">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitDisabled}
                            className={`${duplicateError ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Guardando...
                                </>
                            ) : checkingDuplicate ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Verificando...
                                </>
                            ) : duplicateError ? (
                                <>
                                    <X className="h-4 w-4 mr-2" />
                                    No se puede guardar
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    {isEdit ? "Actualizar" : "Crear"} Resumen
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
