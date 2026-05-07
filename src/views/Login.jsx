import { useState } from "react"

const CREDENTIALS = { usuario: "admin", contrasenia: "admin5" }

function Icon({ name, className = "" }) {
  return <span className={`material-symbols-outlined leading-none select-none ${className}`}>{name}</span>
}

export default function Login({ onLogin }) {
  const [usuario, setUsuario] = useState("")
  const [contrasenia, setContrasenia] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(false)

    setTimeout(() => {
      if (
        usuario.trim() === CREDENTIALS.usuario &&
        contrasenia === CREDENTIALS.contrasenia
      ) {
        sessionStorage.setItem("pva_admin", "1")
        onLogin()
      } else {
        setError(true)
        setLoading(false)
      }
    }, 600)
  }

  return (
    <div className="min-h-screen bg-[#f0f4fa] flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">

        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <Icon name="school" className="text-white text-4xl" />
          </div>
          <div>
            <h1 className="font-bold text-2xl text-primary">Plataforma de</h1>
            <h1 className="font-bold text-2xl text-primary">Validación Académica</h1>
            <p className="text-sm text-on-surface-variant mt-1">Panel de Administración</p>
          </div>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-5"
        >
          <h2 className="font-semibold text-on-surface text-base">Iniciar sesión</h2>

          {/* Usuario */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">
              Usuario
            </label>
            <div className="flex items-center border border-outline-variant rounded-xl overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
              <span className="pl-3 text-on-surface-variant">
                <Icon name="person" className="text-xl" />
              </span>
              <input
                type="text"
                value={usuario}
                onChange={(e) => { setUsuario(e.target.value); setError(false) }}
                placeholder="Ingrese su usuario"
                autoComplete="username"
                autoFocus
                className="flex-1 px-3 py-3 text-sm bg-transparent outline-none text-on-surface placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Contraseña */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">
              Contraseña
            </label>
            <div className="flex items-center border border-outline-variant rounded-xl overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
              <span className="pl-3 text-on-surface-variant">
                <Icon name="lock" className="text-xl" />
              </span>
              <input
                type={showPass ? "text" : "password"}
                value={contrasenia}
                onChange={(e) => { setContrasenia(e.target.value); setError(false) }}
                placeholder="Ingrese su contraseña"
                autoComplete="current-password"
                className="flex-1 px-3 py-3 text-sm bg-transparent outline-none text-on-surface placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="pr-3 text-on-surface-variant hover:text-primary transition-colors"
                tabIndex={-1}
              >
                <Icon name={showPass ? "visibility_off" : "visibility"} className="text-xl" />
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-error-container text-on-error-container rounded-xl px-4 py-3 text-sm">
              <Icon name="error" className="text-base flex-shrink-0" />
              Usuario o contraseña incorrectos.
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !usuario.trim() || !contrasenia}
            className="w-full py-3 bg-primary text-on-primary font-bold rounded-xl text-sm
                       hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2 transition-all"
          >
            {loading ? (
              <><Icon name="hourglass_empty" className="text-base" /> Verificando…</>
            ) : (
              <><Icon name="login" className="text-base" /> Iniciar sesión</>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          SVA Platform · Sistema de Validación Académica
        </p>
      </div>
    </div>
  )
}
