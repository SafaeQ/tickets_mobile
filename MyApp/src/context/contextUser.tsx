import React, {FC, ReactNode} from 'react';
import {User} from '../types';

interface GlobalStateUser {
  currentUser: User;
  setCurrentUser: React.Dispatch<React.SetStateAction<User>>;
}

export interface TicketsType {
  closedCount?: number | undefined;
  inProgressCount?: number | undefined;
  openCount?: number | undefined;
  reopenCount?: number | undefined;
  resolvedCount?: number | undefined;
}

interface GlobalStatetickets {
  ticketsGlobl: TicketsType;
  setTicketsGlobal: React.Dispatch<React.SetStateAction<TicketsType>>;
}
interface GlobalStateState {
  usersState: GlobalStateUser;
  ticketState: GlobalStatetickets;
}
export const TicketsContext = React.createContext({} as GlobalStateState);

export const TicketsProvider: FC<{children: ReactNode}> = ({children}) => {
  const [currentUser, setCurrentUser] = React.useState<User>({} as User);
  const [ticketsGlobl, setTicketsGlobal] = React.useState<TicketsType>(
    {} as TicketsType,
  );

  return (
    <TicketsContext.Provider
      value={{
        usersState: {currentUser, setCurrentUser},
        ticketState: {ticketsGlobl, setTicketsGlobal},
      }}>
      {children}
    </TicketsContext.Provider>
  );
};

export default function useUsersAtom(): [
  User,
  React.Dispatch<React.SetStateAction<User>>,
] {
  const useCurrentUser = React.useContext(TicketsContext);
  const {currentUser, setCurrentUser} = useCurrentUser.usersState;
  return [currentUser, setCurrentUser];
}
