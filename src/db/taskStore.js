import { getDb } from "./mongoClient.js";
import { ObjectId } from 'mongodb';

const COLLECTION = 'tasksDB';

// Obtener todas las tareas
export async function getAll() {
    const tasks = await getDb().collection(COLLECTION).find().toArray();
    return tasks.map(task => ({
        ...task,
        id: task._id.toString()
    }));
}

// Obtener tarea por ID
export async function getById(id) {
    const task = await getDb().collection(COLLECTION).findOne({ _id: new ObjectId(id) });
    if (!task) return null;
    return {
        ...task,
        id: task._id.toString()
    };
}

// Crear nueva tarea
export async function create(taskData) {
    const now = new Date();
    const newTask = {
        ...taskData,
        completed: false,
        createdAt: now,
        updatedAt: now
    };
    
    const result = await getDb().collection(COLLECTION).insertOne(newTask);
    return {
        id: result.insertedId.toString(),
        ...newTask
    };
}

// Actualizar tarea
export async function update(id, taskData) {
    const updateData = {
        ...taskData,
        updatedAt: new Date()
    };
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.id;

    const result = await getDb().collection(COLLECTION).findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: 'after' }
    );

    if (!result) return null;
    return {
        ...result,
        id: result._id.toString()
    };
}

// Eliminar tarea
export async function remove(id) {
    const result = await getDb().collection(COLLECTION).findOneAndDelete(
        { _id: new ObjectId(id) }
    );
    
    if (!result) return null;
    return {
        ...result,
        id: result._id.toString()
    };
}