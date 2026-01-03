import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import {getPrisoners, PrisonerItem} from "../../../services/stationServices/visitorsServices/VisitorsService";
import {handleCatchError, handleServerError2} from "../../../services/stationServices/utils";
import {toast} from "sonner";
import {Court, getCourts, Sentence} from "../../../services/discharge/discharge";

interface ChildProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  prisoners: PrisonerItem
  setPrisoners: React.Dispatch<React.SetStateAction<PrisonerItem[]>>
}

export const DischargeSuspendedSentenceForm: React.FC<ChildProps> = ({
  prisoners, setPrisoners,
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Sentence>({
    is_active: true,
    deleted_datetime: null,
    discharge_datetime: "",
    remarks: "",
    intended_place_of_stay: "",
    duration_of_suspension: 0,
    conditions_for_suspension: "",
    conviction_date: "",
    deleted_by: null,
    request: "",
    prisoner: "",
    discharge_type: "",
    discharge_reason: "",
    court_details: ""
  });

  // API Integration
  const [loader, setLoader] = useState(true)
  const [courts, setCourts] = useState<Court[]>([])

  useEffect(() => {
    fetchData()
  }, [loader]);

  function populateList(response: any, msg: string, setData: any){
    if (handleServerError2(response)) {
      onCancel()
      return true
    }
    if ("results" in response) {
      const data = response.results
      if (!data.length) {
        toast.error(msg)
        onCancel()
        return true
      }
      else {
        setData(data)
      }
    }

    return false
  }

  function returnedValue(value: boolean) {
    if(value) {
      return
    }
  }

  async function fetchData() {
    try{
      if (!prisoners.length){
        const response = await getPrisoners()
        returnedValue(populateList(response, "There are no prisoners", setPrisoners))
      }

      const response2 = await getCourts()
      returnedValue(populateList(response2, "There are no courts", setCourts))

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
                  <Label>Court *</Label>
                  <Select value={formData.court_details}
                          onValueChange={(v) => {
                              const selectedCourt = courts.find(p => p.id === v);
                              if (!selectedCourt) return;
                              setFormData(prev => ({
                                ...prev,
                                court_details: selectedCourt.id,
                              }));
                          }}
                          disabled={initialData}
                  >
                    <SelectTrigger><SelectValue placeholder="Select court" /></SelectTrigger>
                    <SelectContent>
                      {
                        courts.map(court => (
                            <SelectItem key={court.id} value={court.id}>{court.name}</SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Duration of Suspension (months) *</Label>
                  <Input type="number" value={formData.duration_of_suspension} onChange={(e) => setFormData({...formData, duration_of_suspension: parseInt(e.target.value)})} required />
                </div>
                <div>
                  <Label>Conviction Date *</Label>
                  <Input type="date" value={formData.conviction_date} onChange={(e) => setFormData({...formData, conviction_date: e.target.value})} required />
                </div>
                <div>
                  <Label>Discharge Date & Time *</Label>
                  <Input type="datetime-local" value={formData.discharge_datetime.slice(0, 16)} onChange={(e) => setFormData({...formData, discharge_datetime: e.target.value + ':00Z'})} required />
                </div>
                <div className="col-span-2">
                  <Label>Conditions for Suspension</Label>
                  <Textarea value={formData.conditions_for_suspension} onChange={(e) => setFormData({...formData, conditions_for_suspension: e.target.value})} rows={3} />
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
