import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabase';
import { 
  LayoutDashboard, KanbanSquare, Calendar as CalendarIcon, Search, Bell, 
  Clock, LogIn, Lock, X, Wallet, ListTodo, ChevronLeft, ChevronRight, 
  Calculator, AlertTriangle, Trash2, Edit3, CheckCircle2, FileDown, 
  BarChart3, Layers, Flag, User2, TrendingUp, Briefcase, Plus, Filter,
  Settings, Moon, Sun, Download
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

// ==========================================
// 1. CẤU HÌNH & DỮ LIỆU MẪU
// ==========================================
const USERS = [
  { id: 'u1', username: 'admin', password: '1234@', name: 'Lê Ngọc Sang ( Trưởng nhóm )', role: 'PM', rate: 500000, avatar: '👔', memberId: 'PM-GOLD-001' },
  { id: 'u2', username: 'nv2', password: '123', name: 'Nguyễn Văn Tiến ( Phó nhóm )', role: 'Fullstack', rate: 250000, avatar: '👨‍💻', memberId: 'DEV-FULL-888' },
  { id: 'u3', username: 'nv3', password: '123', name: 'Phạm Đức Nhân', role: 'Analyst', rate: 200000, avatar: '👩‍💼', memberId: 'BA-PRO-999' },
  { id: 'u4', username: 'nv4', password: '123', name: 'Nguyễn Đức Long ', role: 'Designer', rate: 180000, avatar: '🎨', memberId: 'UIUX-ART-202' }
];

const INITIAL_COLS = {
  todo: { id: "todo", name: "Cần làm", items: [] },
  doing: { id: "doing", name: "Đang làm", items: [] },
  review: { id: "review", name: "Kiểm soát", items: [] },
  done: { id: "done", name: "Hoàn tất", items: [] }
};

// ==========================================
// 2. LOGIC TÍNH TOÁN PERT
// ==========================================
const calcPert = (o, m, p, rate) => {
  const e = (Number(o) + 4 * Number(m) + Number(p)) / 6;
  const sd = (Number(p) - Number(o)) / 6;
  return {
    time: parseFloat(e.toFixed(1)),
    cost: Math.round(e * rate),
    risk: sd > 2 ? 'High' : sd > 1 ? 'Medium' : 'Low'
  };
};

// ==========================================
// 3. COMPONENT CHÍNH
// ==========================================
export default function App() {
  const [user, setUser] = useState(null);
  const [login, setLogin] = useState({ u: '', p: '' });
  const [view, setView] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState({ open: false, task: null });
  // --------------------------------------------------------

  const [data, setData] = useState(INITIAL_COLS);

  // Tự động gọi dữ liệu từ Supabase khi mở web
  useEffect(() => {
    const fetchTasks = async () => {
      // Gọi bảng Task từ Database của Sang
      const { data: tasks, error } = await supabase.from('Task').select('*');
      
      if (error) {
        console.error("Lỗi lấy dữ liệu:", error);
        return;
      }

      if (tasks && tasks.length > 0) {
        // Biến đổi dữ liệu dạng danh sách của Database thành dạng Cột Kéo Thả
        const newCols = JSON.parse(JSON.stringify(INITIAL_COLS));
        
        tasks.forEach(t => {
          // Giả sử task có trạng thái mặc định là 'todo' (Cần làm)
          const status = t.status || 'todo'; 
          
          if (newCols[status]) {
            newCols[status].items.push({
              id: t.id.toString(), // Bắt buộc là chuỗi để kéo thả không bị lỗi
              title: t.task_name || 'Công việc chưa tên',
              assigneeId: 'u1', // Tạm thời gán cho user 1, sau này map với user_id thật
              avatar: '👨‍💻',
              time: t.est || 0,
              cost: t.cost || 0,
              risk: t.risk || 'Low',
              day: 1 
            });
          }
        });
        
        setData(newCols); // Cập nhật lên giao diện
      }
    };

    fetchTasks();
  }, []); // [] có nghĩa là chỉ chạy 1 lần khi load trang

  // --- THỐNG KÊ TỔNG HỢP ---
  const stats = useMemo(() => {
    let totalTime = 0, totalCost = 0, finished = 0, total = 0;
    const userWork = {};
    Object.values(data).forEach(col => {
      total += col.items.length;
      if (col.id === 'done') finished += col.items.length;
      col.items.forEach(i => {
        totalTime += i.time; totalCost += i.cost;
        userWork[i.assigneeId] = (userWork[i.assigneeId] || 0) + i.time;
      });
    });
    return { time: totalTime.toFixed(1), cost: totalCost, percent: total ? Math.round((finished/total)*100) : 0, total, userWork };
  }, [data]);

  // --- XỬ LÝ SỰ KIỆN ---
  // Đổi hàm thành async để đợi gọi Database
  const handleAuth = async (e) => {
    e.preventDefault();
    
    // Gọi bảng 'Users' từ Database của Sang (nhớ check kỹ tên bảng viết hoa hay thường)
    const { data: users, error } = await supabase
      .from('Users') 
      .select('*')
      // Map ô nhập liệu đầu tiên vào cột email, ô thứ 2 vào cột password
      .eq('email', login.u) 
      .eq('password', login.p);

    if (error) {
      alert("Lỗi kết nối Server: " + error.message);
      return;
    }

    // Nếu mảng users trả về có dữ liệu => Đúng tài khoản & mật khẩu
    if (users && users.length > 0) {
      const dbUser = users[0]; // Lấy user đầu tiên tìm được
      
      // Chuyển đổi dữ liệu DB sang cấu trúc mà giao diện cần
      setUser({
        id: dbUser.id.toString(),
        username: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
        avatar: dbUser.role === 'Admin' ? 'Member' : 'Developer', 
        rate: 200000 // Tạm để fix cứng, sau này bạn có thể thêm cột rate (lương) vào DB
      });
    } else {
      alert("Sai tài khoản hoặc mật khẩu! (Lưu ý nhập đúng Email đăng nhập)");
    }
  };

  const onDragEnd = (res) => {
    if (!res.destination) return;
    const { source: s, destination: d } = res;
    const newCols = { ...data };
    const [moved] = newCols[s.droppableId].items.splice(s.index, 1);
    newCols[d.droppableId].items.splice(d.index, 0, moved);
    setData(newCols);
  };

  // Nhớ thêm chữ async ở đây
  const saveTask = async (taskData) => {
    const assignee = USERS.find(u => u.id === taskData.assigneeId);
    const { time, cost, risk } = calcPert(taskData.o, taskData.m, taskData.p, assignee.rate);
    const newTask = { ...taskData, time, cost, risk, assigneeName: assignee.name, avatar: assignee.avatar };

    // 1. CẤT LÊN DATABASE CỦA SANG TRƯỚC
    const { error } = await supabase
      .from('Task')
      .insert([
        { 
           task_name: newTask.title, 
           est: newTask.time,
           cost: newTask.cost,
           risk: newTask.risk
           // Thêm các trường khác tương ứng với bảng Task trong Supabase của bạn
        }
      ]);

    if (error) {
      alert("Lỗi lưu lên Database: " + error.message);
      return;
    }

    // 2. CẬP NHẬT LÊN GIAO DIỆN NẾU LƯU DATABASE THÀNH CÔNG
    const newCols = { ...data };
    if (modal.task?.id) {
      Object.keys(newCols).forEach(id => {
        newCols[id].items = newCols[id].items.map(i => i.id === modal.task.id ? newTask : i);
      });
    } else {
      newCols.todo.items.push({ ...newTask, id: `T-${Date.now()}` });
    }
    setData(newCols);
    setModal({ open: false, task: null });
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'bao-cao-du-an.json'; a.click();
  };

  if (!user) return <Login login={login} setLogin={setLogin} onAuth={handleAuth} />;

  return (
    <div className="flex h-screen bg-[#F4F7FE] text-[#1B2559] font-sans overflow-hidden">
      {/* SIDEBAR SIÊU CẤP */}
      <aside className="w-72 bg-white flex flex-col p-8 shadow-2xl shadow-gray-100 z-50">
        <div className="flex items-center gap-4 mb-14 px-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-200">D.IT</div>
          <h1 className="text-xl font-black tracking-tight text-gray-800">DựÁn.PRO</h1>
        </div>

        <nav className="flex-1 space-y-2">
          <Menu active={view === 'dashboard'} icon={<LayoutDashboard/>} label="Dashboard" onClick={() => setView('dashboard')} />
          <Menu active={view === 'kanban'} icon={<KanbanSquare/>} label="Bảng Kanban" onClick={() => setView('kanban')} />
          <Menu active={view === 'timeline'} icon={<Layers/>} label="Dòng thời gian" onClick={() => setView('timeline')} />
          <Menu active={view === 'resource'} icon={<User2/>} label="Nhân sự & Chi phí" onClick={() => setView('resource')} />
        </nav>

        <div className="mt-auto bg-gray-50 rounded-3xl p-6 border border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-2xl">{user.avatar}</div>
            <div className="overflow-hidden">
              <p className="text-sm font-black truncate">{user.name}</p>
              <p className="text-[10px] font-bold text-blue-500 uppercase">{user.role}</p>
            </div>
          </div>
          <button onClick={() => setUser(null)} className="w-full py-3 bg-white text-red-500 rounded-xl font-bold text-[11px] uppercase border border-red-50 hover:bg-red-50 transition-all">Đăng xuất</button>
        </div>
      </aside>

      {/* VÙNG LÀM VIỆC CHÍNH */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-24 px-10 flex items-center justify-between bg-[#F4F7FE]/80 backdrop-blur-md">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Trang chủ / {view}</p>
            <h2 className="text-2xl font-black text-[#1B2559] capitalize">{view === 'kanban' ? 'Quản lý Task' : view}</h2>
          </div>
          <div className="flex items-center gap-6 bg-white p-2 rounded-3xl shadow-sm border border-gray-50">
            <div className="flex items-center bg-gray-50 px-4 py-2 rounded-2xl w-64 border border-gray-100">
              <Search size={16} className="text-gray-400" />
              <input placeholder="Tìm kiếm công việc..." className="ml-3 bg-transparent border-none outline-none text-xs font-bold w-full" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button onClick={exportData} className="p-3 text-gray-400 hover:text-blue-600 transition-colors"><Download size={20}/></button>
            <button className="p-3 text-gray-400 hover:text-blue-600 transition-colors"><Bell size={20}/></button>
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-black">{user.name[0]}</div>
          </div>
        </header>

        <div className="flex-1 overflow-auto px-10 pb-10">
          {view === 'dashboard' && <Dashboard stats={stats} />}
          {view === 'kanban' && <KanbanBoard data={data} search={search} onDragEnd={onDragEnd} onEdit={t => setModal({open: true, task: t})} onAdd={() => setModal({open: true, task: null})} onDelete={(cid, tid) => {
             const n = {...data}; n[cid].items = n[cid].items.filter(i => i.id !== tid); setData(n);
          }} canAdd={user.role === 'PM'} />}
          {view === 'timeline' && <Timeline data={data} />}
          {view === 'resource' && <ResourceView stats={stats} />}
        </div>
      </main>

      {/* MODAL NHẬP LIỆU PERT */}
      {modal.open && <TaskModal task={modal.task} close={() => setModal({open: false, task: null})} onSave={saveTask} />}
    </div>
  );
}

// ==========================================
// 4. CÁC COMPONENT CON (UI/UX)
// ==========================================

function Dashboard({ stats }) {
  return (
    <div className="grid grid-cols-4 gap-6 animate-in fade-in duration-500">
      <StatCard label="Tổng ngân sách" val={new Intl.NumberFormat('vi-VN').format(stats.cost) + 'đ'} icon={<Wallet className="text-blue-500"/>} color="blue" />
      <StatCard label="Tổng giờ làm" val={stats.time + 'h'} icon={<Clock className="text-purple-500"/>} color="purple" />
      <StatCard label="Tiến độ dự án" val={stats.percent + '%'} icon={<TrendingUp className="text-emerald-500"/>} color="emerald" />
      <StatCard label="Số lượng Task" val={stats.total} icon={<ListTodo className="text-orange-500"/>} color="orange" />
      
      <div className="col-span-3 bg-white p-8 rounded-[40px] shadow-sm border border-gray-50 flex flex-col justify-center">
        <h3 className="text-lg font-black mb-6 flex items-center gap-2"><BarChart3 size={20} className="text-blue-600"/> Tóm lược dự án</h3>
        <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
          <div className="absolute h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-1000 shadow-lg" style={{width: `${stats.percent}%`}}></div>
        </div>
        <div className="flex justify-between mt-4 text-xs font-black text-gray-400 uppercase tracking-widest">
          <span>Khởi động</span>
          <span>Đang thực hiện ({stats.percent}%)</span>
          <span>Hoàn thành</span>
        </div>
      </div>
      
      <div className="col-span-1 bg-blue-600 p-8 rounded-[40px] text-white shadow-xl shadow-blue-100">
        <h3 className="font-black text-sm uppercase opacity-60 mb-8">Trình trạng Rủi ro</h3>
        <div className="text-5xl font-black mb-2">Thấp</div>
        <p className="text-xs font-bold opacity-80 leading-relaxed">Dựa trên thuật toán PERT, các task bi quan (Pessimistic) đang ở mức kiểm soát được.</p>
      </div>
    </div>
  );
}

function KanbanBoard({ data, search, onDragEnd, onEdit, onAdd, onDelete, canAdd }) {
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

// --- TIỆN ÍCH UI KHÁC ---

function StatCard({ label, val, icon, color }) {
  return (
    <div className="bg-white p-7 rounded-[40px] shadow-sm border border-gray-50 flex items-center gap-5 hover:scale-105 transition-transform">
      <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-2xl shadow-inner">{icon}</div>
      <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p><p className="text-xl font-black text-[#1B2559]">{val}</p></div>
    </div>
  );
}

function Menu({ active, icon, label, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sm transition-all ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'text-gray-400 hover:bg-gray-50'}`}>
      {React.cloneElement(icon, { size: 18 })} {label}
    </button>
  );
}

function TaskModal({ task, close, onSave }) {
  const [f, setF] = useState(task || { title: '', assigneeId: '', day: 1, o: 0, m: 0, p: 0, priority: 'Medium' });
  return (
    <div className="fixed inset-0 bg-[#1B2559]/30 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-2xl p-12 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-10">
          <h3 className="text-2xl font-black flex items-center gap-3"><Calculator className="text-blue-600"/> {task ? 'Cập nhật Task' : 'Thiết lập PERT'}</h3>
          <button onClick={close} className="p-3 hover:bg-gray-100 rounded-2xl transition-colors"><X/></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave(f); }} className="space-y-6">
          <input required className="w-full p-5 bg-gray-50 border-none rounded-2xl font-bold placeholder:text-gray-300" placeholder="Tên công việc" value={f.title} onChange={e => setF({...f, title: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <select className="p-5 bg-gray-50 rounded-2xl font-bold" value={f.assigneeId} onChange={e => setF({...f, assigneeId: e.target.value})} required>
              <option value="">Giao cho...</option>
              {USERS.filter(u => u.role !== 'PM').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <input type="number" className="p-5 bg-gray-50 rounded-2xl font-bold" placeholder="Ngày hạn (1-31)" value={f.day} onChange={e => setF({...f, day: e.target.value})} />
          </div>
          <div className="bg-[#1B2559] p-8 rounded-[32px] text-white">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-6 text-center">Tham số ước lượng (Giờ công)</p>
            <div className="grid grid-cols-3 gap-6">
               <div className="space-y-2 text-center"><label className="text-[10px] font-bold opacity-60">Lạc quan (O)</label><input type="number" className="w-full bg-white/10 p-4 rounded-2xl font-black text-center" value={f.o} onChange={e => setF({...f, o: e.target.value})} /></div>
               <div className="space-y-2 text-center"><label className="text-[10px] font-bold opacity-60">Khả thi (M)</label><input type="number" className="w-full bg-white/10 p-4 rounded-2xl font-black text-center" value={f.m} onChange={e => setF({...f, m: e.target.value})} /></div>
               <div className="space-y-2 text-center"><label className="text-[10px] font-bold opacity-60">Bi quan (P)</label><input type="number" className="w-full bg-white/10 p-4 rounded-2xl font-black text-center" value={f.p} onChange={e => setF({...f, p: e.target.value})} /></div>
            </div>
          </div>
          <div className="flex gap-4 justify-end pt-4">
            <button type="button" onClick={close} className="px-8 py-4 font-black text-gray-400">Hủy</button>
            <button type="submit" className="bg-blue-600 text-white px-12 py-4 rounded-2xl font-black shadow-xl shadow-blue-100 hover:scale-105 transition-all">LƯU CÔNG VIỆC</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Timeline({ data }) {
  const all = Object.values(data).flatMap(c => c.items).sort((a,b) => a.day - b.day);
  return (
    <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-50 overflow-x-auto">
      <div className="min-w-[1000px] space-y-6">
        <div className="flex border-b pb-4 text-[10px] font-black text-gray-300 uppercase">
          <div className="w-64">Công việc</div>
          <div className="flex-1 flex justify-between px-4">{Array.from({length: 15}).map(i => <div key={i}>Ngày {i*2+1}</div>)}</div>
        </div>
        {all.map(t => (
          <div key={t.id} className="flex items-center group">
            <div className="w-64 font-bold text-sm truncate pr-6">{t.avatar} {t.title}</div>
            <div className="flex-1 h-10 bg-gray-50 rounded-2xl relative">
              <div className="absolute h-full bg-blue-600 rounded-2xl shadow-lg flex items-center px-4 text-[9px] font-black text-white" style={{ left: `${(t.day-1)*3.2}%`, width: `${Math.max(10, t.time*2)}%` }}>{t.time}h</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResourceView({ stats }) {
  return (
    <div className="grid grid-cols-2 gap-8">
      <div className="bg-white p-10 rounded-[40px] shadow-sm">
        <h3 className="font-black mb-8 text-blue-600">Phân bổ nhân sự</h3>
        <div className="space-y-8">
          {USERS.filter(u => u.role !== 'PM').map(u => {
            const h = stats.userWork[u.id] || 0;
            const p = stats.time > 0 ? (h / stats.time) * 100 : 0;
            return (
              <div key={u.id}>
                <div className="flex justify-between font-black text-xs mb-3"><span>{u.avatar} {u.name}</span><span className="text-gray-400">{h}h ({p.toFixed(0)}%)</span></div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-blue-600 transition-all duration-700" style={{width: `${p}%`}}></div></div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="bg-[#1B2559] p-10 rounded-[40px] text-white flex flex-col justify-center items-center text-center">
        <div className="w-20 h-20 bg-blue-500 rounded-3xl flex items-center justify-center mb-6 shadow-2xl rotate-12"><Wallet size={40}/></div>
        <h3 className="text-3xl font-black mb-2">{new Intl.NumberFormat('vi-VN').format(stats.cost)}đ</h3>
        <p className="text-xs font-bold text-blue-300 uppercase tracking-widest">Tổng chi phí nhân công dự toán</p>
      </div>
    </div>
  );
}

function Login({ login, setLogin, onAuth }) {
  // Tìm user dựa trên username đang nhập để lấy memberId riêng
  const currentUser = USERS.find(u => u.username === login.u);

  return (
    <div className="h-screen bg-[#F4F7FE] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] bg-blue-200/40 rounded-full blur-[120px]"></div>
      <div className="w-full max-w-[500px] bg-white rounded-[60px] p-16 shadow-2xl relative z-10 border border-white">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-2xl rotate-6"><Lock size={30}/></div>
          <h2 className="text-4xl font-black text-[#1B2559] tracking-tighter mb-2">Đăng nhập.</h2>
          <p className="text-gray-400 font-bold">Quản trị dự án theo chuẩn PERT</p>
        </div>
        <form onSubmit={onAuth} className="space-y-6">
          <input 
            className="w-full p-5 bg-gray-50 border-none rounded-2xl font-bold placeholder:text-gray-300" 
            placeholder="Username (admin/dev1/design1)" 
            value={login.u} 
            onChange={e => setLogin({...login, u: e.target.value})} 
          />
          <input 
            type="password" 
            className="w-full p-5 bg-gray-50 border-none rounded-2xl font-bold placeholder:text-gray-300" 
            placeholder="Password" 
            value={login.p} 
            onChange={e => setLogin({...login, p: e.target.value})} 
          />
          
          <div className="pt-2">
            <p className="text-[10px] font-black text-blue-500 uppercase ml-2 mb-2">Mã định danh thành viên riêng</p>
            <input 
              className="w-full p-5 bg-blue-50 border-2 border-blue-100 rounded-2xl font-black text-blue-600 uppercase" 
              // Hiển thị mã định danh tương ứng với User, nếu không có thì để trống
              value={currentUser ? currentUser.memberId : "CHỜ NHẬP USER..."} 
              readOnly 
            />
          </div>
          
          <button className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black text-lg shadow-2xl shadow-blue-100 hover:scale-[1.02] active:scale-95 transition-all mt-4 uppercase tracking-widest">
            Vào hệ thống
          </button>
        </form>
      </div>
    </div>
  );
}