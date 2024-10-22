import React, { useCallback, useEffect, useState } from "react";
import Header from "./components/Header";
import Grid from "./components/Grid";
import { GET_TICKETS_URL } from "./constants";
import { loadGrid, mapUsersByUserId } from "./utils";
import { Ticket, User } from "./interfaces";
import Loader from "./components/Loader";
import "./App.css";

function App() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [userData, setUserData] = useState<Record<string, User>>({});
  const [gridData, setGridData] = useState<Record<string, Ticket[]>>({});
  const [grouping, setGrouping] = useState<string>("status");
  const [ordering, setOrdering] = useState<string>("priority");
  const [loading, setLoading] = useState(true);

  const loadSettings = useCallback(() => {
    setGrouping(localStorage.getItem("grouping") || "status");
    setOrdering(localStorage.getItem("ordering") || "priority");
  }, []);

  const saveSettings = useCallback((data: Record<string, string>) => {
    for (let key in data) localStorage.setItem(key, data[key]);
  }, []);

  useEffect(() => {
    loadSettings();
    fetch(GET_TICKETS_URL)
      .then((resp) => resp.json())
      .then((res) => {
        const { tickets, users } = res;
        setTickets(tickets);
        setUserData(mapUsersByUserId(users));
      })
      .catch((err) => {});
  }, [loadSettings]); // Include loadSettings as a dependency

  useEffect(() => {
    if (!tickets.length) return;
    setGridData(loadGrid(tickets, grouping, ordering));
    setLoading(false);
  }, [grouping, ordering, tickets]); // No changes needed here

  const onSetGrouping = useCallback(
    (value: string) => {
      setLoading(true);
      setGrouping(value);
      saveSettings({ grouping: value });
    },
    [saveSettings]
  ); // Include saveSettings as a dependency

  const onSetOrdering = useCallback(
    (value: string) => {
      setLoading(true);
      setOrdering(value);
      saveSettings({ ordering: value });
    },
    [saveSettings]
  ); // Include saveSettings as a dependency

  return (
    <div className="App">
      <Header
        grouping={grouping}
        setGrouping={onSetGrouping}
        ordering={ordering}
        setOrdering={onSetOrdering}
      />
      {loading ? (
        <Loader />
      ) : (
        <Grid gridData={gridData} grouping={grouping} userIdToData={userData} />
      )}
    </div>
  );
}

export default App;
