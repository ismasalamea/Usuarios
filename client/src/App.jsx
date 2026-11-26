import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowDown,
  ArrowUp,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Download,
  Ellipsis,
  LayoutDashboard,
  ListFilter,
  LoaderCircle,
  Mail,
  Menu,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
  UserRound,
  UserRoundCheck,
  UsersRound,
  X
} from 'lucide-react';
import { usersApi } from './api.js';

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  position: '',
  department: '',
  status: 'active'
};

const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

const palettes = ['violet', 'blue', 'green', 'orange', 'pink', 'cyan'];

function App() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuUserId, setMenuUserId] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page: String(page), limit: '8' };
      if (search.trim()) params.q = search.trim();
      if (statusFilter !== 'all') params.status = statusFilter;
      const [result, summary] = await Promise.all([usersApi.list(params), usersApi.stats()]);
      setUsers(result.users);
      setTotal(result.total);
      setPages(Math.max(result.pages, 1));
      setStats(summary);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    const timer = window.setTimeout(loadData, 250);
    return () => window.clearTimeout(timer);
  }, [loadData]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const range = useMemo(() => {
    if (!total) return '0';
    return `${(page - 1) * 8 + 1}–${Math.min(page * 8, total)}`;
  }, [page, total]);

  function openCreate() {
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setModalOpen(true);
  }

  function openEdit(user) {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      position: user.position || '',
      department: user.department || '',
      status: user.status
    });
    setFormError('');
    setModalOpen(true);
    setMenuUserId(null);
  }

  async function submitForm(event) {
    event.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      if (editingUser) {
        await usersApi.update(editingUser._id, form);
      } else {
        await usersApi.create(form);
      }
      setModalOpen(false);
      await loadData();
    } catch (requestError) {
      setFormError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteUser(user) {
    setMenuUserId(null);
    if (!window.confirm(`¿Eliminar a ${user.name}? Esta acción no se puede deshacer.`)) return;
    try {
      await usersApi.remove(user._id);
      if (users.length === 1 && page > 1) setPage(page - 1);
      else await loadData();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  function exportCsv() {
    const columns = ['Nombre', 'Correo', 'Teléfono', 'Cargo', 'Departamento', 'Estado'];
    const rows = users.map((user) => [
      user.name,
      user.email,
      user.phone,
      user.position,
      user.department,
      user.status === 'active' ? 'Activo' : 'Inactivo'
    ]);
    const csv = [columns, ...rows]
      .map((row) => row.map((value) => `"${String(value || '').replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'usuarios.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenuOpen ? 'sidebar-open' : ''}`}>
        <a className="brand" href="#" aria-label="Nexo, inicio">
          <span className="brand-mark"><UsersRound size={20} strokeWidth={2.5} /></span>
          <span>nexo<span className="brand-period">.</span></span>
        </a>
        <div className="workspace-switcher">
          <span className="workspace-avatar">A</span>
          <span className="workspace-copy"><strong>Acme Studio</strong><small>Plan Profesional</small></span>
          <ChevronDown size={16} />
        </div>
        <div className="nav-label">ESPACIO DE TRABAJO</div>
        <nav className="main-nav" aria-label="Navegación principal">
          <a className="nav-item" href="#dashboard"><LayoutDashboard size={18} />Resumen</a>
          <a className="nav-item active" href="#usuarios"><UsersRound size={18} />Usuarios<span className="nav-count">{stats.total}</span></a>
          <a className="nav-item" href="#actividad"><Activity size={18} />Actividad</a>
        </nav>
        <div className="nav-label tools-label">PREFERENCIAS</div>
        <nav className="main-nav" aria-label="Preferencias">
          <a className="nav-item" href="#ajustes"><Settings size={18} />Configuración</a>
          <a className="nav-item" href="#ayuda"><CircleHelp size={18} />Centro de ayuda</a>
        </nav>
        <div className="sidebar-bottom">
          <div className="plan-card">
            <div className="plan-icon"><ShieldCheck size={17} /></div>
            <strong>Tu espacio está protegido</strong>
            <p>Gestiona el acceso de tu equipo desde un solo lugar.</p>
            <a href="#seguridad">Ver seguridad <ChevronRight size={14} /></a>
          </div>
          <button className="profile-button" type="button">
            <span className="profile-avatar">JS</span>
            <span className="profile-copy"><strong>Jorge Salamea</strong><small>Administrador</small></span>
            <MoreHorizontal size={19} />
          </button>
        </div>
      </aside>

      {mobileMenuOpen && <button className="sidebar-backdrop" onClick={() => setMobileMenuOpen(false)} aria-label="Cerrar menú" />}

      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu-button icon-button" onClick={() => setMobileMenuOpen(true)} aria-label="Abrir menú"><Menu size={20} /></button>
          <div className="breadcrumbs"><span>Espacio de trabajo</span><ChevronRight size={15} /><strong>Usuarios</strong></div>
          <div className="topbar-right">
            <span className="secure-label"><span className="secure-dot" />Todos los sistemas operativos</span>
            <button className="help-button" aria-label="Ayuda"><CircleHelp size={19} /></button>
            <span className="top-avatar">JS</span>
          </div>
        </header>

        <div className="page-content">
          <div className="page-heading">
            <div>
              <div className="eyebrow"><span className="eyebrow-dot" />ADMINISTRACIÓN DEL EQUIPO</div>
              <h1>Usuarios</h1>
              <p className="page-subtitle">Administra las personas y los accesos de tu espacio de trabajo.</p>
            </div>
            <button className="primary-button" onClick={openCreate}><Plus size={18} />Añadir usuario</button>
          </div>

          <section className="stats-grid" aria-label="Resumen de usuarios">
            <StatCard label="Total de usuarios" value={stats.total} icon={<UsersRound size={19} />} tone="purple" trend="Equipo completo" />
            <StatCard label="Usuarios activos" value={stats.active} icon={<UserRoundCheck size={19} />} tone="green" trend="Con acceso habilitado" />
            <StatCard label="Usuarios inactivos" value={stats.inactive} icon={<UserRound size={19} />} tone="amber" trend="Sin acceso al espacio" />
            <StatCard label="Departamentos" value={new Set(users.map((user) => user.department).filter(Boolean)).size} icon={<BriefcaseBusiness size={19} />} tone="blue" trend="En esta página" />
          </section>

          <section className="users-panel" id="usuarios">
            <div className="panel-heading">
              <div>
                <h2>Directorio del equipo</h2>
                <p>Consulta, edita y administra los miembros de tu equipo.</p>
              </div>
              <button className="export-button" onClick={exportCsv} disabled={!users.length}><Download size={16} />Exportar</button>
            </div>
            <div className="toolbar">
              <label className="search-box">
                <Search size={17} />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre, correo o equipo..." />
                {search && <button type="button" className="clear-search" onClick={() => setSearch('')} aria-label="Limpiar búsqueda"><X size={15} /></button>}
              </label>
              <label className="filter-select">
                <ListFilter size={16} />
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filtrar por estado">
                  <option value="all">Todos los estados</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                </select>
                <ChevronDown size={14} />
              </label>
            </div>

            {error && <div className="error-banner" role="alert">{error}<button onClick={loadData}>Reintentar</button></div>}
            <div className="table-scroll">
              <table>
                <thead>
                  <tr><th>USUARIO</th><th>ROL / DEPARTAMENTO</th><th>ESTADO</th><th>FECHA DE REGISTRO</th><th><span className="sr-only">Acciones</span></th></tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td className="table-message" colSpan="5"><LoaderCircle className="spinner" size={22} />Cargando usuarios...</td></tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan="5">
                        <div className="empty-state">
                          <span className="empty-icon"><UsersRound size={23} /></span>
                          <strong>{search || statusFilter !== 'all' ? 'No encontramos usuarios' : 'Aún no hay usuarios'}</strong>
                          <p>{search || statusFilter !== 'all' ? 'Prueba con otros términos o cambia el filtro.' : 'Añade a tu primer miembro para empezar a organizar tu equipo.'}</p>
                          {!search && statusFilter === 'all' && <button className="primary-button small-button" onClick={openCreate}><Plus size={16} />Añadir usuario</button>}
                        </div>
                      </td>
                    </tr>
                  ) : users.map((user, index) => (
                    <tr key={user._id}>
                      <td>
                        <div className="user-cell">
                          <span className={`user-avatar ${palettes[index % palettes.length]}`}>{initials(user.name)}</span>
                          <span className="user-info"><strong>{user.name}</strong><span><Mail size={13} />{user.email}</span></span>
                        </div>
                      </td>
                      <td><div className="role-cell"><strong>{user.position || 'Sin cargo asignado'}</strong><span>{user.department || 'Sin departamento'}</span></div></td>
                      <td><span className={`status-pill ${user.status}`}><span />{user.status === 'active' ? 'Activo' : 'Inactivo'}</span></td>
                      <td className="date-cell">{new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(user.createdAt))}</td>
                      <td className="actions-cell">
                        <div className="row-actions">
                          <button className="row-action-button" onClick={() => openEdit(user)} aria-label={`Editar ${user.name}`} title="Editar"><Pencil size={16} /></button>
                          <div className="more-wrap">
                            <button className="row-action-button" onClick={() => setMenuUserId(menuUserId === user._id ? null : user._id)} aria-label={`Más acciones para ${user.name}`} title="Más acciones"><Ellipsis size={18} /></button>
                            {menuUserId === user._id && <div className="row-menu"><button className="danger-menu-item" onClick={() => deleteUser(user)}><Trash2 size={15} />Eliminar usuario</button></div>}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-footer">
              <span>Mostrando <strong>{range}</strong> de <strong>{total}</strong> usuarios</span>
              <div className="pagination">
                <button className="page-button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1} aria-label="Página anterior"><ChevronLeft size={17} /></button>
                <span>Página <strong>{page}</strong> de <strong>{pages}</strong></span>
                <button className="page-button" onClick={() => setPage((current) => Math.min(pages, current + 1))} disabled={page >= pages} aria-label="Página siguiente"><ChevronRight size={17} /></button>
              </div>
            </div>
          </section>
          <footer className="page-footer"><span>© 2025 Nexo Workspace</span><span><a href="#privacidad">Privacidad</a><a href="#terminos">Términos</a><span className="footer-status"><span />Todos los sistemas operativos</span></span></footer>
        </div>
      </main>

      {modalOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalOpen(false); }}>
          <section className="user-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="modal-heading">
              <div><span className="modal-icon"><UserRound size={19} /></span><div><h2 id="modal-title">{editingUser ? 'Editar usuario' : 'Añadir usuario'}</h2><p>{editingUser ? 'Actualiza la información del miembro.' : 'Completa los datos para invitar a tu equipo.'}</p></div></div>
              <button className="icon-button" onClick={() => setModalOpen(false)} aria-label="Cerrar"><X size={19} /></button>
            </div>
            <form onSubmit={submitForm}>
              <div className="form-grid">
                <label className="form-field full-field"><span>Nombre completo <i>*</i></span><input autoFocus required minLength="2" maxLength="80" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Ej. María García" /></label>
                <label className="form-field full-field"><span>Correo electrónico <i>*</i></span><input type="email" required maxLength="254" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="nombre@empresa.com" /></label>
                <label className="form-field"><span>Cargo</span><input maxLength="80" value={form.position} onChange={(event) => setForm({ ...form, position: event.target.value })} placeholder="Ej. Diseñadora" /></label>
                <label className="form-field"><span>Departamento</span><input maxLength="80" value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} placeholder="Ej. Diseño" /></label>
                <label className="form-field"><span>Teléfono</span><input type="tel" maxLength="30" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="+593 99 123 4567" /></label>
                <label className="form-field"><span>Estado</span><span className="select-field"><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option value="active">Activo</option><option value="inactive">Inactivo</option></select><ChevronDown size={15} /></span></label>
              </div>
              {formError && <p className="form-error" role="alert">{formError}</p>}
              <div className="modal-footer"><span><i>*</i> Campos obligatorios</span><div><button type="button" className="cancel-button" onClick={() => setModalOpen(false)}>Cancelar</button><button type="submit" className="primary-button" disabled={saving}>{saving ? <LoaderCircle className="spinner" size={16} /> : <Check size={16} />}{saving ? 'Guardando...' : editingUser ? 'Guardar cambios' : 'Crear usuario'}</button></div></div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, tone, trend }) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${tone}`}>{icon}</div>
      <div className="stat-content"><span>{label}</span><div><strong>{value}</strong><span className="stat-trend"><span>{trend}</span></span></div><small>{trend}</small></div>
      <span className={`stat-decoration ${tone}`} />
    </article>
  );
}

export default App;
