export type SampleDraftPT = {
  numero: number;
  placa: string;
  amperajes: string[];
  litros: string;
};

export type SampleDraftMP = {
  numero: number;
  medida1: string;
  medida2: string;
  medida3: string;
  medida4: string;
};

export function emptyPT(numero: number): SampleDraftPT {
  return {
    numero,
    placa: "",
    amperajes: ["", "", "", "", "", "", ""],
    litros: "",
  };
}

export function emptyMP(numero: number): SampleDraftMP {
  return {
    numero,
    medida1: "",
    medida2: "",
    medida3: "",
    medida4: "",
  };
}
