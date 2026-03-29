"use client";

import { useState } from "react";
import { MateriaPrimaForm } from "./MateriaPrimaForm";

export function MateriaPrimaFormContainer() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
    window.location.reload();
  };

  return <MateriaPrimaForm onSuccess={handleSuccess} key={refreshKey} />;
}
