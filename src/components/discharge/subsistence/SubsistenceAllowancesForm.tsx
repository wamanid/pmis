import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import {Loader} from "../ViewDischargeDetails";
import {getPrisoners, PrisonerItem} from "../../../services/stationServices/visitorsServices/VisitorsService";
import {handleCatchError, handleServerError2} from "../../../services/stationServices/utils";
import {toast} from "sonner";
import {SubsistenceAllowance} from "../../../services/discharge/discharge";

interface ChildProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  prisoners: PrisonerItem
  setPrisoners: React.Dispatch<React.SetStateAction<PrisonerItem[]>>
}

export const SubsistenceAllowancesForm: React.FC<ChildProps> = ({
  prisoners, setPrisoners,
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<SubsistenceAllowance>({
    is_active: true,
    deleted_datetime: null,
    allowance_amount: "",
    creditor_details: "",
    disposal_date: "",
    remarks: "",
    deleted_by: null,
    prisoner: "",
  });

  // API Integration
  const [loader, setLoader] = useState(true)

  useEffect(() => {
    if(loader && !prisoners.length) {
      fetchData()
    }
    else {
      setLoader(false)
    }
  }, [loader]);

  async function fetchData() {
    try{
      const response = await getPrisoners()
      if (handleServerError2(response)) {
        onCancel()
      }
      if ("results" in response) {
        const data = response.results
        if (!data.length) {
          toast.error("There are no prisoners")
          onCancel()
        }
        else {
          setPrisoners(data)
        }
      }

    }catch (error) {
      handleCatchError(error)
    }finally {
      setLoader(false)
    }
  }

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-6">
      {
        loader ? (
            <div className="size-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground text-sm">
                      Fetching subsistence allowances Information, Please wait...
                    </p>
              </div>
            </div>
        ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Prisoner *</Label>
                  <Select value={formData.prisoner} disabled={initialData} onValueChange={(v) =>{
                      const selectedPrisoner = prisoners.find(p => p.id === v);
                      if (!selectedPrisoner) return;
                      setFormData(prev => ({
                        ...prev,
                        prisoner: selectedPrisoner.id,
                      }));
                  }}>
                    <SelectTrigger><SelectValue placeholder="Select prisoner" /></SelectTrigger>
                    <SelectContent>
                      {
                        prisoners.map(prisoner => (
                            <SelectItem key={prisoner.id} value={prisoner.id}>{prisoner.full_name} ({prisoner.prisoner_number_value})</SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Allowance Amount (UGX) *</Label>
                  <Input type="number" step="0.01" value={formData.allowance_amount} onChange={(e) => setFormData({...formData, allowance_amount: e.target.value})} required />
                </div>
                <div className="col-span-2">
                  <Label>Creditor Details *</Label>
                  <Input value={formData.creditor_details} onChange={(e) => setFormData({...formData, creditor_details: e.target.value})} required />
                </div>
                <div>
                  <Label>Disposal Date *</Label>
                  <Input type="date" value={formData.disposal_date} onChange={(e) => setFormData({...formData, disposal_date: e.target.value})} required />
                </div>
                <div className="col-span-2">
                  <Label>Remarks</Label>
                  <Textarea value={formData.remarks} onChange={(e) => setFormData({...formData, remarks: e.target.value})} rows={3} />
                </div>
              </div>
              <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{initialData ? 'Update' : 'Create'}</Button>
      </div>
            </>
        )
      }

    </form>
  );
};
