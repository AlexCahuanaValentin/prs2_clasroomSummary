"use client"

import { useState, useEffect } from "react"
import { BarChart2, Search, Filter, Plus, Edit, Trash2, RotateCcw, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import DashboardLayout from "@/components/layouts/DashboardLayout"
import Modal from "./modal"
import Swal from "sweetalert2"
import { ClassroomGradeRecord } from "./types/classroomSummaryTypes"
import {
    searchClassroomSummaries,
    disableClassroomSummary,
    restoreClassroomSummary,
    deleteClassroomSummary,
    createClassroomSummary,
    updateClassroomSummary,
} from "./services/classroomSummaryService"

// Datos de filtros (normalmente vendrían de una API)
const filterData = {
    classrooms: [
        { id: 1, name: "Primer grado A - Primaria" },
        { id: 2, name: "Primer grado B - Primaria" },
        { id: 3, name: "Segundo grado A - Primaria" },
        { id: 4, name: "Tercero grado A - Primaria" },
        { id: 5, name: "Quarto grado A - Primaria" },

    ],
    periods: [
        { id: 2, name: "Año Escolar 2023" },
        { id: 3, name: "Año Escolar 2024" },
    ],
}

export default function ClassroomSummaryPage() {
    const [records, setRecords] = useState<ClassroomGradeRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("A")
    const [classroomFilter, setClassroomFilter] = useState<string>("all")
    const [periodFilter, setPeriodFilter] = useState<string>("all")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingRecord, setEditingRecord] = useState<ClassroomGradeRecord | null>(null)
    const [viewMode, setViewMode] = useState<"table" | "cards">("cards")

    // Cargar datos iniciales
    useEffect(() => {
        loadRecords()
    }, [statusFilter, classroomFilter, periodFilter])

    const loadRecords = async () => {
        try {
            setLoading(true)
            const classroomId = classroomFilter !== "all" ? Number.parseInt(classroomFilter) : undefined
            const periodId = periodFilter !== "all" ? Number.parseInt(periodFilter) : undefined
            const status = statusFilter

            const data = await searchClassroomSummaries(classroomId, periodId, status)
            setRecords(data)
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudieron cargar los registros",
                confirmButtonColor: "#3b82f6",
            })
        } finally {
            setLoading(false)
        }
    }

    // Filtrar por término de búsqueda
    const filteredRecords = records.filter((record) => {
        const classroom = filterData.classrooms.find((c) => c.id === record.classroomId)
        const period = filterData.periods.find((p) => p.id === record.periodId)
        const searchText = `${classroom?.name || ""} ${period?.name || ""} ${record.observation}`.toLowerCase()
        return searchText.includes(searchTerm.toLowerCase())
    })

    const handleCreate = () => {
        setEditingRecord(null)
        setIsModalOpen(true)
    }

    const handleEdit = (record: ClassroomGradeRecord) => {
        setEditingRecord(record)
        setIsModalOpen(true)
    }

    const handleSave = async (data: any) => {
        try {
            if (editingRecord) {
                await updateClassroomSummary(editingRecord.id, data)
                Swal.fire({
                    icon: "success",
                    title: "¡Actualizado!",
                    text: "El resumen ha sido actualizado correctamente",
                    confirmButtonColor: "#10b981",
                })
            } else {
                await createClassroomSummary(data)
                Swal.fire({
                    icon: "success",
                    title: "¡Creado!",
                    text: "El resumen ha sido creado correctamente",
                    confirmButtonColor: "#10b981",
                })
            }
            setIsModalOpen(false)
            loadRecords()
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo guardar el resumen",
                confirmButtonColor: "#ef4444",
            })
        }
    }

    const handleDisable = async (record: ClassroomGradeRecord) => {
        const result = await Swal.fire({
            title: "¿Estás seguro?",
            text: "Este resumen será marcado como inactivo",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Sí, desactivar",
            cancelButtonText: "Cancelar",
        })

        if (result.isConfirmed) {
            try {
                await disableClassroomSummary(record.id)
                Swal.fire({
                    icon: "success",
                    title: "¡Desactivado!",
                    text: "El resumen ha sido desactivado",
                    confirmButtonColor: "#10b981",
                })
                loadRecords()
            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "No se pudo desactivar el resumen",
                    confirmButtonColor: "#ef4444",
                })
            }
        }
    }

    const handleRestore = async (record: ClassroomGradeRecord) => {
        const result = await Swal.fire({
            title: "¿Restaurar resumen?",
            text: "Este resumen volverá a estar activo",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#10b981",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Sí, restaurar",
            cancelButtonText: "Cancelar",
        })

        if (result.isConfirmed) {
            try {
                await restoreClassroomSummary(record.id)
                Swal.fire({
                    icon: "success",
                    title: "¡Restaurado!",
                    text: "El resumen ha sido restaurado",
                    confirmButtonColor: "#10b981",
                })
                loadRecords()
            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "No se pudo restaurar el resumen",
                    confirmButtonColor: "#ef4444",
                })
            }
        }
    }

    const handleDelete = async (record: ClassroomGradeRecord) => {
        const result = await Swal.fire({
            title: "¿Eliminar definitivamente?",
            text: "Esta acción no se puede deshacer",
            icon: "error",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        })

        if (result.isConfirmed) {
            try {
                await deleteClassroomSummary(record.id)
                Swal.fire({
                    icon: "success",
                    title: "¡Eliminado!",
                    text: "El resumen ha sido eliminado definitivamente",
                    confirmButtonColor: "#10b981",
                })
                loadRecords()
            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "No se pudo eliminar el resumen",
                    confirmButtonColor: "#ef4444",
                })
            }
        }
    }

    const getClassroomName = (classroomId: number) => {
        return filterData.classrooms.find((c) => c.id === classroomId)?.name || "Aula no encontrada"
    }

    const getPeriodName = (periodId: number) => {
        return filterData.periods.find((p) => p.id === periodId)?.name || "Período no encontrado"
    }

    const renderActionButtons = (record: ClassroomGradeRecord) => {
        if (record.status === "A") {
            return (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(record)}
                        className="hover:bg-blue-50 hover:border-blue-300"
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDisable(record)}
                        className="hover:bg-red-50 hover:border-red-300 text-red-600"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        } else {
            return (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRestore(record)}
                        className="hover:bg-green-50 hover:border-green-300 text-green-600"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(record)}
                        className="hover:bg-red-50 hover:border-red-300 text-red-600"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    }

    const renderCards = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecords.map((record) => (
                <Card
                    key={record.id}
                    className={`transition-all duration-200 hover:shadow-lg ${record.status === "I" ? "opacity-75 border-gray-300" : "border-blue-200"}`}
                >
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <CardTitle className="text-lg font-semibold text-gray-900">
                                    {getClassroomName(record.classroomId)}
                                </CardTitle>
                                <CardDescription className="text-sm text-gray-600">{getPeriodName(record.periodId)}</CardDescription>
                            </div>
                            <Badge
                                variant={record.status === "A" ? "default" : "secondary"}
                                className={record.status === "A" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                            >
                                {record.status === "A" ? "Activo" : "Inactivo"}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Estadísticas principales */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-blue-50 p-3 rounded-lg">
                                <p className="text-blue-600 font-medium">Total Estudiantes</p>
                                <p className="text-2xl font-bold text-blue-800">{record.gradeSummary.totalStudents}</p>
                            </div>
                            <div className="bg-green-50 p-3 rounded-lg">
                                <p className="text-green-600 font-medium">Promedio</p>
                                <p className="text-2xl font-bold text-green-800">{record.gradeSummary.averageGrade.toFixed(1)}</p>
                            </div>
                        </div>

                        {/* Rango de notas */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-emerald-50 p-2 rounded-lg">
                                <p className="text-emerald-600 font-medium text-xs">Mejor Nota</p>
                                <p className="text-lg font-bold text-emerald-800">{record.gradeSummary.topPerformance}</p>
                            </div>
                            <div className="bg-orange-50 p-2 rounded-lg">
                                <p className="text-orange-600 font-medium text-xs">Menor Nota</p>
                                <p className="text-lg font-bold text-orange-800">{record.gradeSummary.lowestPerformance}</p>
                            </div>
                        </div>

                        {/* Análisis de competencias */}
                        {record.competencyStats.competencyAnalysis.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-700">Competencias:</p>
                                <div className="space-y-1">
                                    {record.competencyStats.competencyAnalysis.map((competency, index) => (
                                        <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded text-xs">
                                            <span className="font-medium text-gray-700">{competency.name}</span>
                                            <span className="text-gray-900 font-bold">{competency.classroomAverage.toFixed(1)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Áreas de mejora */}
                        {record.competencyStats.improvementAreas.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-700">Áreas de Mejora:</p>
                                <div className="flex flex-wrap gap-1">
                                    {record.competencyStats.improvementAreas.map((area, index) => (
                                        <Badge key={index} variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                                            {area}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="text-sm">
                            <p className="text-gray-600 font-medium mb-1">Observación:</p>
                            <p className="text-gray-800 line-clamp-2">{record.observation}</p>
                        </div>

                        <div className="text-xs text-gray-500">
                            <p>Creado: {new Date(record.createdAt).toLocaleDateString()}</p>
                            <p>Por: {record.createdBy}</p>
                        </div>

                        <div className="flex justify-end pt-2 border-t">{renderActionButtons(record)}</div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )

    const renderTable = () => (
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold">Aula</TableHead>
                        <TableHead className="font-semibold">Período</TableHead>
                        <TableHead className="font-semibold">Estado</TableHead>
                        <TableHead className="font-semibold">Estudiantes</TableHead>
                        <TableHead className="font-semibold">Promedio</TableHead>
                        <TableHead className="font-semibold">Competencias</TableHead>
                        <TableHead className="font-semibold">Áreas de Mejora</TableHead>
                        <TableHead className="font-semibold">Observación</TableHead>
                        <TableHead className="font-semibold">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredRecords.map((record) => (
                        <TableRow key={record.id} className={record.status === "I" ? "opacity-75 bg-gray-50" : "hover:bg-blue-50"}>
                            <TableCell className="font-medium">{getClassroomName(record.classroomId)}</TableCell>
                            <TableCell>{getPeriodName(record.periodId)}</TableCell>
                            <TableCell>
                                <Badge
                                    variant={record.status === "A" ? "default" : "secondary"}
                                    className={record.status === "A" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                                >
                                    {record.status === "A" ? "Activo" : "Inactivo"}
                                </Badge>
                            </TableCell>
                            <TableCell>{record.gradeSummary.totalStudents}</TableCell>
                            <TableCell>
                                <div className="space-y-1">
                                    <div className="font-medium">{record.gradeSummary.averageGrade.toFixed(1)}</div>
                                    <div className="text-xs text-gray-500">
                                        {record.gradeSummary.lowestPerformance} - {record.gradeSummary.topPerformance}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="max-w-xs">
                                {record.competencyStats.competencyAnalysis.length > 0 ? (
                                    <div className="space-y-1">
                                        {record.competencyStats.competencyAnalysis.map((comp, idx) => (
                                            <div key={idx} className="text-xs bg-blue-50 p-1 rounded flex justify-between">
                                                <span className="truncate">{comp.name}</span>
                                                <span className="font-medium ml-2">{comp.classroomAverage.toFixed(1)}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-gray-400 text-xs">Sin datos</span>
                                )}
                            </TableCell>
                            <TableCell className="max-w-xs">
                                {record.competencyStats.improvementAreas.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                        {record.competencyStats.improvementAreas.map((area, idx) => (
                                            <Badge key={idx} variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                                                {area}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-gray-400 text-xs">Ninguna</span>
                                )}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">{record.observation}</TableCell>
                            <TableCell>{renderActionButtons(record)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <BarChart2 className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Resumen de Aula</h1>
                            <p className="text-gray-600">Gestiona los resúmenes de calificaciones por aula y período</p>
                        </div>
                    </div>
                    <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo Resumen
                    </Button>
                </div>

                {/* Filtros */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filtros
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Buscar..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="A">Activos</SelectItem>
                                    <SelectItem value="I">Inactivos</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={classroomFilter} onValueChange={setClassroomFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Aula" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas las aulas</SelectItem>
                                    {filterData.classrooms.map((classroom) => (
                                        <SelectItem key={classroom.id} value={classroom.id.toString()}>
                                            {classroom.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={periodFilter} onValueChange={setPeriodFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Período" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los períodos</SelectItem>
                                    {filterData.periods.map((period) => (
                                        <SelectItem key={period.id} value={period.id.toString()}>
                                            {period.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <div className="flex gap-2">
                                <Button
                                    variant={viewMode === "cards" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setViewMode("cards")}
                                    className="flex-1"
                                >
                                    Tarjetas
                                </Button>
                                <Button
                                    variant={viewMode === "table" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setViewMode("table")}
                                    className="flex-1"
                                >
                                    Tabla
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Registros</p>
                                    <p className="text-2xl font-bold text-gray-900">{records.length}</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-full">
                                    <BarChart2 className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Activos</p>
                                    <p className="text-2xl font-bold text-green-600">{records.filter((r) => r.status === "A").length}</p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-full">
                                    <Eye className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Inactivos</p>
                                    <p className="text-2xl font-bold text-gray-600">{records.filter((r) => r.status === "I").length}</p>
                                </div>
                                <div className="p-3 bg-gray-100 rounded-full">
                                    <Trash2 className="h-6 w-6 text-gray-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Filtrados</p>
                                    <p className="text-2xl font-bold text-blue-600">{filteredRecords.length}</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-full">
                                    <Search className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Contenido principal */}
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="ml-3 text-gray-600">Cargando registros...</p>
                    </div>
                ) : filteredRecords.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <BarChart2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay registros</h3>
                            <p className="text-gray-600 mb-4">No se encontraron resúmenes con los filtros aplicados</p>
                            <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="h-4 w-4 mr-2" />
                                Crear primer resumen
                            </Button>
                        </CardContent>
                    </Card>
                ) : viewMode === "cards" ? (
                    renderCards()
                ) : (
                    renderTable()
                )}

                {/* Modal */}
                <Modal
                    isOpen={isModalOpen}
                    isEdit={!!editingRecord}
                    data={editingRecord}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    classrooms={filterData.classrooms}
                    periods={filterData.periods}
                />
            </div>
        </DashboardLayout>
    )
}
