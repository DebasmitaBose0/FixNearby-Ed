import { createContext, useContext } from 'react';
import useGeolocation from '../hooks/useGeolocation';

/**
 * LocationContext
 * Provides { coords, loading, error, permissionDenied, retry } to the entire tree.
 * coords → { latitude, longitude, accuracy } | null
 */
const LocationContext = createContext(null);

export const LocationProvider = ({ children }) => {
  const geo = useGeolocation();
  return (
    <LocationContext.Provider value={geo}>
      {children}
    </LocationContext.Provider>
  );
};

/**
 * useLocation – consume the location context anywhere in the app.
 * Must be used inside <LocationProvider>.
 */
export const useLocation = () => {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error('useLocation must be used inside <LocationProvider>');
  }
  return ctx;
};

export default LocationContext;
