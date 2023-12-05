export interface PastellDocInfo {
    id_d: string;
    type: string;
    titre: string;
    creation: string;
    modification: string;
  }

export interface PastellLastAction {
    action: string;
    message: string;
    date: string;
  }

export interface PastellDocCreated {
    info: PastellDocInfo;
    data: any;
    action_possible: string[];
    last_action: PastellLastAction;
    id_d: string;
  }

export interface PastellContent {
    info: PastellDocInfo;
    data: any;
    action_possible: string[];
    last_action: PastellLastAction;
  }

export interface PastellFileUploaded {
    result: string;
    formulaire_ok: number;
    message: string;
    content: PastellContent;
  }

export interface DocCreated {
    pastel: PastellDocCreated;
    link:  string;
  }

export interface DocUploaded {
    pastell: PastellDocCreated;
  }