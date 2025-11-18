export interface StageAssignment {
  id: string;
  prisoner_name: string;
  prisoner_number: string;
  stage_name: string;
  start_date: string;
  end_date: string | null;
  remark: string;
  prisoner: string;
  stage: string;
}

export interface StageAssignFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stageAssignment?: StageAssignment | null;
  onSuccess: () => void;
}

export interface Stage {
  id: string;
  name: string;
  description: string;
}