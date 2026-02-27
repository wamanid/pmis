import { Prisoner } from "../gate/Prisoner";


export interface Stage {
  id: string;
  stage: string;
  description: string;
}



export interface StageAssignmentPost {
  id: string;
  prisoners?: Prisoner[];
  stage: string;
  start_date: String;
  end_date: String;
  remark: String;
  status: String;
  prisoner: String;
}


export interface  OffenceRequest {
  prisoner: String;
}

export interface StageDemotionPost {
  prisoners?: String[];
  start_date: String;
  end_date: String;
  remark: String;
  stage?: String;
}