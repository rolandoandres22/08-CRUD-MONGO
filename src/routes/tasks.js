import { Router } from 'express';
import { getAll, getById, create, update, remove } from '../db/taskStore.js';

const router = Router();
const VALID_PRIORITIES = ['low', 'mid', 'high'];

// GET /api/tasks --> obtener todas las tareas
router.get("/", async (req, res, next) => {
    try {
        const tasks = await getAll();
        if (tasks.length === 0) {
            return res.status(200).json({ 
                success: true, 
                data: [],
                message: 'No hay tareas disponibles' 
            });
        }
        res.json({ success: true, data: tasks });
    } catch (error) {
        next(error);
    }
});

// GET /api/tasks/:id --> obtener tarea por ID
router.get("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        const task = await getById(id);
        
        if (!task) {
            return res.status(404).json({ 
                success: false, 
                message: `Tarea con ID ${id} no encontrada` 
            });
        }
        
        res.json({ success: true, data: task });
    } catch (error) {
        if (error.message.includes('ObjectId')) {
            return res.status(400).json({ 
                success: false, 
                message: 'ID inválido' 
            });
        }
        next(error);
    }
});

// POST /api/tasks --> crear una tarea
router.post("/", async (req, res, next) => {
    try {
        const { title, description = "", priority = "low" } = req.body;
        
        // Validaciones
        if (!title) {
            return res.status(400).json({ 
                success: false, 
                message: 'El título es requerido' 
            });
        }
        
        if (!VALID_PRIORITIES.includes(priority)) {
            return res.status(400).json({ 
                success: false, 
                message: `Prioridad inválida. Debe ser: ${VALID_PRIORITIES.join(', ')}` 
            });
        }
        
        const newTask = await create({ title, description, priority });
        res.status(201).json({ success: true, data: newTask });
        
    } catch (error) {
        next(error);
    }
});

// PUT /api/tasks/:id --> modificar una tarea existente
router.put("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description, priority, completed } = req.body;
        
        // Verificar que la tarea existe
        const existingTask = await getById(id);
        if (!existingTask) {
            return res.status(404).json({ 
                success: false, 
                message: `Tarea con ID ${id} no encontrada` 
            });
        }
        
        // Validar prioridad si viene
        if (priority && !VALID_PRIORITIES.includes(priority)) {
            return res.status(400).json({ 
                success: false, 
                message: `Prioridad inválida. Debe ser: ${VALID_PRIORITIES.join(', ')}` 
            });
        }
        
        // Construir objeto con los campos a actualizar
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (priority !== undefined) updateData.priority = priority;
        if (completed !== undefined) updateData.completed = completed;
        
        const updatedTask = await update(id, updateData);
        res.json({ success: true, data: updatedTask });
        
    } catch (error) {
        if (error.message.includes('ObjectId')) {
            return res.status(400).json({ 
                success: false, 
                message: 'ID inválido' 
            });
        }
        next(error);
    }
});

// DELETE /api/tasks/:id --> eliminar una tarea
router.delete("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const deletedTask = await remove(id);
        
        if (!deletedTask) {
            return res.status(404).json({ 
                success: false, 
                message: `Tarea con ID ${id} no encontrada` 
            });
        }
        
        res.json({ 
            success: true, 
            message: `Tarea con ID ${id} eliminada exitosamente`,
            data: deletedTask
        });
        
    } catch (error) {
        if (error.message.includes('ObjectId')) {
            return res.status(400).json({ 
                success: false, 
                message: 'ID inválido' 
            });
        }
        next(error);
    }
});

export default router;