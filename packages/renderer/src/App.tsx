import { useEffect, useMemo } from 'react'
import { useStore } from './store/useStore'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { HashRouter, Routes, Route } from 'react-router-dom'
import Info from './pages/example/Info'
import pkg from '../../../package.json'
import Home from './pages/Home'
import Example from './pages/example/Example'
import HorizontalFlow from './pages/flow/Flow'
import { SnackbarProvider } from 'notistack'
import ws, { WsContext } from './api/Websocket'

export const hydrateStore = () => {
  const getSchema = useStore((state) => state.api.getSchema)
  const getEffects = useStore((state) => state.api.getEffects)
  const getSettings = useStore((state) => state.api.getSettings)
  const getDevices = useStore((state) => state.api.getDevices)
  const getVirtuals = useStore((state) => state.api.getVirtuals)
  const getConnections = useStore((state) => state.api.getConnections)
  const getGlobalEffectConfig = useStore((state) => state.api.getGlobalEffectConfig)

  Promise.all([
    getSchema(),
    getEffects(),
    getSettings(),
    getDevices(),
    getVirtuals(),
    getConnections(),
    getGlobalEffectConfig(),
  ])
  console.log("hydrated store!")

}

const App = () => {
  const darkMode = useStore((state) => state.ui.darkMode)
  const showSnackbar = useStore((state) => state.ui.showSnackbar)

  hydrateStore();

  const theme = useMemo(
    () =>
      createTheme({
        components: {
          MuiButton: {
            defaultProps: {
              variant: 'contained',
              size: 'small',
            },
          },
          MuiChip: {
            defaultProps: {
              variant: 'outlined',
              sx: {
                m: 0.3,
              },
            },
          },
        },
        palette: {
          primary: {
            main:
              pkg.env.VITRON_PRIMARY_COLOR === 'default'
                ? '#1976d2'
                : pkg.env.VITRON_PRIMARY_COLOR,
          },
          mode: darkMode ? 'dark' : 'light',
        },
      }),
    [darkMode]
  )

  useEffect(() => {
    const handleWebsockets = (e: any) => {
      showSnackbar(e.detail.type, e.detail.message)
    }
    document.addEventListener('YZNEW', handleWebsockets)
    return () => {
      document.removeEventListener('YZNEW', handleWebsockets)
    }
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider maxSnack={5}>
        <WsContext.Provider value={ws}>
          <HashRouter>
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/Example' element={<Example />} />
              <Route path='/Info' element={<Info />} />
              <Route path='/Flow' element={<HorizontalFlow />} />
            </Routes>
          </HashRouter>
        </WsContext.Provider>
      </SnackbarProvider>
    </ThemeProvider>
  )
}

export default App
