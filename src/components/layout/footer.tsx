export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-zinc-600">
        <p className="font-medium text-zinc-800">AyudaVerificada</p>
        <p className="mt-1">Plataforma de ayuda económica verificada. Los aportes se transfieren directamente, sin intermediarios.</p>
        <p className="mt-2 text-xs">Datos personales y documentos privados no se publican. Cumplimiento con Ley 19.628 / 21.719 (según vigencia).</p>
        <div className="mt-3 flex flex-wrap gap-3 text-xs">
          <a href="/privacy" className="text-emerald-700 hover:underline">Privacidad</a>
          <a href="/terms" className="text-emerald-700 hover:underline">Términos</a>
          <a href="/contact" className="text-emerald-700 hover:underline">Contacto</a>
        </div>
      </div>
    </footer>
  );
}