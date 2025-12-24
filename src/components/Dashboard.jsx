import { useState, useEffect } from 'react';
import { facturasService } from '../services/facturasService';

function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState({
    totalFacturas: 0,
    facturasPendientes: 0,
    facturasPagadas: 0,
    ingresosTotales: 0,
  });
  const [cargando, setCargando] = useState(true);
  const [trend, setTrend] = useState(() => Array(20).fill(0));
  const [lastNet, setLastNet] = useState(0);
  const [totalPendientesAmountState, setTotalPendientesAmountState] = useState(0);
  const [totalIngresosState, setTotalIngresosState] = useState(0);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setCargando(true);
      const facturas = await facturasService.obtenerFacturas();

      let totalIngresos = 0;
      let facturasPagadas = 0;
      let facturasPendientes = 0;

      facturas.forEach((factura) => {
        const totales = facturasService.calcularTotales(factura);
        if (factura.estado_pago === 'pagado') {
          facturasPagadas++;
          totalIngresos += totales.totalGeneral;
        } else {
          facturasPendientes++;
        }
      });

      setStats({
        totalFacturas: facturas.length,
        facturasPendientes,
        facturasPagadas,
        ingresosTotales: totalIngresos,
      });
      // inicializar trend con la posición neta actual y guardar ingresos/pendientes
      const totalPendientesAmount = facturas.reduce((acc, f) => {
        if (f.estado_pago !== 'pagado') {
          const t = facturasService.calcularTotales(f);
          return acc + t.totalGeneral;
        }
        return acc;
      }, 0);
      const netPos = totalIngresos - totalPendientesAmount;
      setTrend(() => Array(20).fill(netPos));
      setLastNet(netPos);
      setTotalPendientesAmountState(totalPendientesAmount);
      setTotalIngresosState(totalIngresos);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setCargando(false);
    }
  };

  // Polling para actualizar la serie temporal de ganancia/pérdida
  useEffect(() => {
    let mounted = true;
    const interval = setInterval(async () => {
      try {
        const facturas = await facturasService.obtenerFacturas();
        let totalIngresos = 0;
        let totalPendientesAmount = 0;
        facturas.forEach((f) => {
          const totales = facturasService.calcularTotales(f);
          if (f.estado_pago === 'pagado') totalIngresos += totales.totalGeneral;
          else totalPendientesAmount += totales.totalGeneral;
        });
        const net = totalIngresos - totalPendientesAmount;
        if (!mounted) return;
        setTrend((prev) => {
          const next = [...prev.slice(prev.length - 19), net];
          return next;
        });
        setLastNet(net);
        setTotalPendientesAmountState(totalPendientesAmount);
        setTotalIngresosState(totalIngresos);
      } catch (e) {
        // ignore polling errors
      }
    }, 3000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CR').format(valor);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold">Taller Rivera</h1>
        <p className="mt-2 text-blue-100">Sistema de Gestión de Facturas</p>
      </div>

      {/* Tarjetas de estadísticas */}
      {cargando ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="ml-4 flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 rounded-full p-3">
                <svg
                  className="h-8 w-8 text-blue-600 dark:text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Facturas
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.totalFacturas}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 dark:bg-yellow-900 rounded-full p-3">
                <svg
                  className="h-8 w-8 text-yellow-600 dark:text-yellow-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pendientes</p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  {stats.facturasPendientes}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 dark:bg-green-900 rounded-full p-3">
                <svg
                  className="h-8 w-8 text-green-600 dark:text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pagadas</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {stats.facturasPagadas}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-white bg-opacity-30 rounded-full p-3">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4 text-white">
                <p className="text-sm font-medium opacity-90">Ingresos Totales</p>
                <p className="text-3xl font-bold">₡{formatearMoneda(stats.ingresosTotales)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Acciones rápidas */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Acciones Rápidas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => onNavigate('nueva-factura')}
            className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg shadow-lg transition duration-200 text-left"
          >
            <div className="flex items-center">
              <svg className="h-10 w-10 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <div>
                <h4 className="text-xl font-semibold">Crear Nueva Factura</h4>
                <p className="text-blue-100 text-sm">Registrar un nuevo trabajo</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('ver-facturas')}
            className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg shadow-lg transition duration-200 text-left"
          >
            <div className="flex items-center">
              <svg className="h-10 w-10 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <div>
                <h4 className="text-xl font-semibold">Ver Todas las Facturas</h4>
                <p className="text-green-100 text-sm">Consultar y gestionar facturas</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Información adicional: gráfico de ganancias/perdidas */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Evolución: Ganancias / Facturas pendientes
        </h3>
        <div className="flex items-center justify-between">
          <div className="w-full pr-4">
            <svg
              className="w-full h-32"
              viewBox="0 0 100 30"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={lastNet >= 0 ? '#10b981' : '#ef4444'}
                    stopOpacity="0.6"
                  />
                  <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* compute points */}
              {(() => {
                const values = trend.slice();
                const max = Math.max(...values, 1);
                const min = Math.min(...values, 0);
                const range = max - min || 1;
                const coords = values.map((v, i) => {
                  const x = (i / (values.length - 1)) * 100;
                  const y = 30 - ((v - min) / range) * 28; // padding
                  return { x, y, v };
                });

                // área points for filled background
                const areaPoints =
                  '0,30 ' +
                  coords.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ') +
                  ' 100,30';

                return (
                  <g>
                    <polyline fill="url(#g)" stroke="none" points={areaPoints} />

                    {/* draw segment-by-segment with color depending on rise/fall */}
                    {coords.slice(0, -1).map((p, i) => {
                      const p2 = coords[i + 1];
                      const isRise = p2.v >= p.v;
                      const stroke = isRise ? '#10b981' : '#ef4444';
                      return (
                        <g key={i}>
                          <line
                            x1={p.x}
                            y1={p.y}
                            x2={p2.x}
                            y2={p2.y}
                            stroke={stroke}
                            strokeWidth={0.8}
                            strokeLinecap="round"
                          />
                          {/* small arrow in the middle of the segment */}
                          <g transform={`translate(${(p.x + p2.x) / 2}, ${(p.y + p2.y) / 2})`}>
                            <polygon
                              points={isRise ? '0,4  -3,-2 3,-2' : '0,-4 -3,2 3,2'}
                              fill={stroke}
                            />
                          </g>
                        </g>
                      );
                    })}

                    {/* last point marker */}
                    <circle
                      cx={coords[coords.length - 1].x}
                      cy={coords[coords.length - 1].y}
                      r={1.1}
                      fill={lastNet >= 0 ? '#10b981' : '#ef4444'}
                    />
                  </g>
                );
              })()}
            </svg>
          </div>
          <div className="w-64 text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">Posición neta actual</p>
            <div className="mt-2 mb-3">
              <p
                className={`text-3xl font-extrabold ${lastNet >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}
              >
                {lastNet >= 0 ? '+' : '-'}₡{formatearMoneda(Math.abs(Math.round(lastNet)))}
              </p>
              <p className="text-xs text-gray-400">(Ingresos - Pendientes)</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 flex items-center justify-center rounded-md bg-green-100 dark:bg-green-800">
                    <svg
                      className="h-4 w-4 text-green-600 dark:text-green-300"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M3 10a1 1 0 011-1h3V6a1 1 0 112 0v3h3a1 1 0 110 2H9v3a1 1 0 11-2 0v-3H4a1 1 0 01-1-1z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">
                      Ganancia (pagadas)
                    </div>
                    <div className="text-sm font-semibold text-green-700 dark:text-green-300">
                      ₡{formatearMoneda(Math.round(totalIngresosState))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between bg-red-50 dark:bg-red-900/20 rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 flex items-center justify-center rounded-md bg-red-100 dark:bg-red-800">
                    <svg
                      className="h-4 w-4 text-red-600 dark:text-red-300"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M7 3a1 1 0 011 1v3h4a1 1 0 110 2H8v3a1 1 0 11-2 0V9H4a1 1 0 110-2h2V4a1 1 0 011-1z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">
                      Pérdida (pendientes)
                    </div>
                    <div className="text-sm font-semibold text-red-700 dark:text-red-300">
                      ₡{formatearMoneda(Math.round(totalPendientesAmountState))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-3 text-xs text-gray-500">
              Actualiza cada 3s mientras haya facturas pendientes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
