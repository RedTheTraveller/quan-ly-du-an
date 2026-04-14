import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, Edit3, Trash2 } from 'lucide-react';

export default function KanbanBoard({ data, search, onDragEnd, onEdit, onAdd, onDelete, canAdd }) {
  return (
    <div className="h-full flex flex-col">
       <div className="flex justify-between items-center mb-6">
        <h3 className="font-black text-gray-500 text-xs uppercase tracking-[0.2em]">Workflow Management</h3>
        {canAdd && <button onClick={onAdd} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-blue-100 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"><Plus size={18}/> Thêm Task</button>}
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
              <div className="flex gap-6 items-start h-full">
                {Object.entries(data).map(([id, col]) => (
                  <div key={id} className="w-80 flex flex-col">
                    <div className="flex items-center justify-between mb-4 px-4 py-2 bg-white rounded-2xl shadow-sm border border-gray-50">
                      <span className="text-xs font-black text-gray-700 uppercase tracking-tighter">{col.name}</span>
                      <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg text-[10px] font-black">{col.items.length}</span>
                    </div>
                    <Droppable droppableId={id}>
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4 min-h-[500px]">
                          {col.items.filter(i => i.title.toLowerCase().includes(search.toLowerCase())).map((item, index) => (
                            <Draggable key={item.id} draggableId={item.id} index={index}>
                              {(provided, snap) => (
                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} 
                                  className={`bg-white p-5 rounded-3xl border border-gray-50 shadow-sm group transition-all ${snap.isDragging ? 'rotate-3 shadow-2xl ring-2 ring-blue-500' : 'hover:shadow-md hover:border-blue-100'}`}>
                                  <div className="flex justify-between mb-4">
                                    <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase ${item.risk === 'High' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-600'}`}>Rủi ro: {item.risk}</span>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                      <button onClick={() => onEdit(item)} className="p-1.5 text-gray-400 hover:text-blue-600"><Edit3 size={14}/></button>
                                      <button onClick={() => onDelete(id, item.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 size={14}/></button>
                                    </div>
                                  </div>
                                  <h4 className="font-bold text-[#1B2559] text-[14px] leading-tight mb-4">{item.title}</h4>
                                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-2">
                                      <div className="text-lg">{item.avatar}</div>
                                      <span className="text-[10px] font-bold text-gray-400">Ngày {item.day}</span>
                                    </div>
                                    <div className="text-[11px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">{item.time}h</div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                ))}
            </div>
        </DragDropContext>
    </div>
  );
}