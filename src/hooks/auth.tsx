/* eslint-disable react/jsx-no-constructed-context-values */
import React, {
  createContext, useCallback, useContext, useState,
} from 'react';
import { api } from '../services/api';

interface AuthState {
  token: string;
  user: object;
}

interface signInCredentials {
  email: string;
  password: string;
}

interface AuthContextData {
  user: object;
  signIn(credentials: signInCredentials): Promise<void>;
  signOut(): void;
}

interface AuthProviderData {
  children: React.ReactNode;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<AuthProviderData> = ({ children }) => {
  const [data, setData] = useState<AuthState>(() => {
    const token = localStorage.getItem('@Go-Barber:token');
    const user = localStorage.getItem('@Go-Barber:user');

    if (token && user) {
      return { token, user: JSON.parse(user) };
    }

    return {} as AuthState;
  });

  const signIn = useCallback(async ({ email, password }: signInCredentials) => {
    const response = await api.post('sessions', {
      email,
      password,
    });

    const { token, user } = response.data;

    localStorage.setItem('@Go-Barber:token', token);
    localStorage.setItem('@Go-Barber:user', JSON.stringify(user));

    setData({ token, user });
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('@Go-Barber:token');
    localStorage.removeItem('@Go-Barber:user');

    setData({} as AuthState);
  }, []);

  return (
    <AuthContext.Provider value={{ user: data.user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an context');
  }

  return context;
}
