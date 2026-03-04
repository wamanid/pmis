import React, { useState } from 'react';
import { BookOpen, Calendar, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Button } from '../../ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../ui/collapsible';
import EnrollmentAssessmentList from './EnrollmentAssessmentList';
import RehabilitationEnrollmentSessionList from './sessions/RehabilitationEnrollmentSessionList';
import AfterCareList from '../afterCare/AfterCareList';

interface RehabilitationEnrollment {
  id: string;
  prisoner_name: string;
  prisoner_number: string;
  programme_name: string;
  programme_stage_name: string;
  sponsor_name: string;
  responsible_officer_name: string;
  progress_status_name: string;
  prisoner_opinion: string;
  date_of_enrollment: string;
  start_date: string;
  end_date: string;
  certificate_awarded: boolean;
  certification_document: string;
  comment: string;
  prisoner: string;
  programme: string;
  programme_stage: string;
  rehabilitation_sponsor: string;
  responsible_officer: number;
  progress_status: string;
}

interface EnrollmentDetailViewProps {
  enrollment: RehabilitationEnrollment;
  onEditAssessment?: (assessment: any) => void;
  onDeleteAssessment?: (id: string) => void;
  onViewAssessment?: (assessment: any) => void;
  onEditSession?: (session: any) => void;
  onDeleteSession?: (id: string) => void;
  onViewSession?: (session: any) => void;
  onEditAfterCare?: (afterCare: any) => void;
  onDeleteAfterCare?: (id: string) => void;
  onViewAfterCare?: (afterCare: any) => void;
}

const EnrollmentDetailView: React.FC<EnrollmentDetailViewProps> = ({
  enrollment,
  onEditAssessment = () => {},
  onDeleteAssessment = () => {},
  onViewAssessment = () => {},
  onEditSession = () => {},
  onDeleteSession = () => {},
  onViewSession = () => {},
  onEditAfterCare = () => {},
  onDeleteAfterCare = () => {},
  onViewAfterCare = () => {},
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);

  const InfoRow = ({ label, value }: { label: string; value?: string | number | boolean | null }) => {
    if (value === undefined || value === null || value === '') return null;

    const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;

    return (
      <div className="grid grid-cols-3 gap-4 py-2">
        <dt className="text-sm text-muted-foreground">{label}</dt>
        <dd className="col-span-2 text-sm">{displayValue}</dd>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      'In Progress': 'bg-blue-100 text-blue-800 border-blue-300',
      'Completed': 'bg-green-100 text-green-800 border-green-300',
      'On Hold': 'bg-orange-100 text-orange-800 border-orange-300',
      'Discontinued': 'bg-red-100 text-red-800 border-red-300',
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    };

    return (
      <Badge variant="outline" className={statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-300'}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 w-full">
      {/* Collapsible Enrollment Details Section */}
      <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" style={{ color: '#650000' }} />
                Enrollment Details
              </CardTitle>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {isDetailsOpen ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-2" />
                      Collapse
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-2" />
                      Expand
                    </>
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
          </CardHeader>
          <CollapsibleContent>
            <CardContent>
              {/* Summary Section */}
              <div className="mb-6 p-4 bg-muted/30 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Prisoner</p>
                    <p className="font-medium">{enrollment.prisoner_name}</p>
                    <p className="text-sm text-muted-foreground">{enrollment.prisoner_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Programme</p>
                    <p className="font-medium">{enrollment.programme_name}</p>
                    <p className="text-sm text-muted-foreground">{enrollment.programme_stage_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <div className="mt-1">{getStatusBadge(enrollment.progress_status_name)}</div>
                  </div>
                </div>
              </div>

              {/* Detailed Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Programme Information */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2" style={{ color: '#650000' }}>
                    <BookOpen className="h-4 w-4" />
                    Programme Information
                  </h4>
                  <dl className="divide-y divide-border">
                    <InfoRow label="Programme" value={enrollment.programme_name} />
                    <InfoRow label="Programme Stage" value={enrollment.programme_stage_name} />
                    <InfoRow label="Sponsor" value={enrollment.sponsor_name} />
                    <InfoRow label="Responsible Officer" value={enrollment.responsible_officer_name} />
                    <InfoRow label="Progress Status" value={enrollment.progress_status_name} />
                  </dl>
                </div>

                {/* Enrollment Dates */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2" style={{ color: '#650000' }}>
                    <Calendar className="h-4 w-4" />
                    Enrollment Dates
                  </h4>
                  <dl className="divide-y divide-border">
                    <InfoRow label="Date of Enrollment" value={formatDate(enrollment.date_of_enrollment)} />
                    <InfoRow label="Start Date" value={formatDate(enrollment.start_date)} />
                    <InfoRow label="End Date" value={formatDate(enrollment.end_date)} />
                  </dl>
                </div>

                {/* Certification */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2" style={{ color: '#650000' }}>
                    <Award className="h-4 w-4" />
                    Certification
                  </h4>
                  <dl className="divide-y divide-border">
                    <InfoRow label="Certificate Awarded" value={enrollment.certificate_awarded} />
                    {enrollment.certification_document && (
                      <InfoRow label="Certification Document" value={enrollment.certification_document} />
                    )}
                  </dl>
                </div>

                {/* Prisoner Opinion & Comments */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2" style={{ color: '#650000' }}>
                    Comments & Opinion
                  </h4>
                  <dl className="divide-y divide-border">
                    {enrollment.prisoner_opinion && (
                      <div className="py-2">
                        <dt className="text-sm text-muted-foreground mb-1">Prisoner Opinion</dt>
                        <dd className="text-sm">{enrollment.prisoner_opinion}</dd>
                      </div>
                    )}
                    {enrollment.comment && (
                      <div className="py-2">
                        <dt className="text-sm text-muted-foreground mb-1">Comment</dt>
                        <dd className="text-sm">{enrollment.comment}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Tabs Section */}
      <Tabs defaultValue="assessments" className="w-full">
        <TabsList
          className="grid w-full grid-cols-3 h-auto p-1 rounded-lg"
          style={{ backgroundColor: '#f5f5f5' }}
        >
          <TabsTrigger
            value="assessments"
            className="rounded-md px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            style={{
              fontWeight: 'normal',
            }}
          >
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>Enrollment Assessments</span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="sessions"
            className="rounded-md px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            style={{
              fontWeight: 'normal',
            }}
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Enrollment Sessions</span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="aftercare"
            className="rounded-md px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            style={{
              fontWeight: 'normal',
            }}
          >
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              <span>After Care Services</span>
            </div>
          </TabsTrigger>
        </TabsList>

        {/* Enrollment Assessments Tab */}
        <TabsContent value="assessments" className="mt-6">
          <EnrollmentAssessmentList
            onView={onViewAssessment}
            onEdit={onEditAssessment}
            onDelete={onDeleteAssessment}
            enrollmentId={enrollment.id}
          />
        </TabsContent>

        {/* Enrollment Sessions Tab */}
        <TabsContent value="sessions" className="mt-6">
          <RehabilitationEnrollmentSessionList
            onView={onViewSession}
            onEdit={onEditSession}
            onDelete={onDeleteSession}
            enrollmentId={enrollment.id}
          />
        </TabsContent>

        {/* After Care Services Tab */}
        <TabsContent value="aftercare" className="mt-6">
          <AfterCareList
            onView={onViewAfterCare}
            onEdit={onEditAfterCare}
            onDelete={onDeleteAfterCare}
            prisonerId={enrollment.prisoner}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnrollmentDetailView;
