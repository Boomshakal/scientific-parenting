'use client';

import React, { useEffect, useState, useCallback, useMemo, use } from 'react';
import { useIllnessStore } from '@/stores/illnessStore';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, TextArea, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/layout/Header';
import { format, parseISO, differenceInDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  IllnessEpisodeDetail,
  IllnessEpisode,
  IllnessRecord,
  Medication,
  DoctorVisit,
  TemperatureMethod,
  AppetiteLevel,
  SleepQualityLevel,
  MoodLevel,
  MedicationRoute,
} from '@/types';

type ModalType = 'record' | 'medication' | 'visit' | null;

interface RecordForm {
  recorded_at: string;
  symptoms: string;
  temperature: string;
  temperature_method: TemperatureMethod;
  appetite: AppetiteLevel;
  sleep_quality: SleepQualityLevel;
  mood: MoodLevel;
  notes: string;
}

interface MedicationForm {
  name: string;
  dosage: string;
  frequency: string;
  route: MedicationRoute;
  start_date: string;
  end_date: string;
  prescribed_by: string;
  notes: string;
}

interface VisitForm {
  visit_date: string;
  hospital: string;
  department: string;
  doctor: string;
  diagnosis: string;
  prescription: string;
  advice: string;
  attachments: string;
}

const emptyRecord: RecordForm = {
  recorded_at: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  symptoms: '',
  temperature: '',
  temperature_method: 'axillary',
  appetite: 'good',
  sleep_quality: 'good',
  mood: 'normal',
  notes: '',
};

const emptyMedication: MedicationForm = {
  name: '',
  dosage: '',
  frequency: '',
  route: 'oral',
  start_date: format(new Date(), 'yyyy-MM-dd'),
  end_date: '',
  prescribed_by: '',
  notes: '',
};

const emptyVisit: VisitForm = {
  visit_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  hospital: '',
  department: '',
  doctor: '',
  diagnosis: '',
  prescription: '',
  advice: '',
  attachments: '',
};

export default function IllnessDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { currentEpisode, loading, fetchEpisode, addRecord, updateRecord, deleteRecord, addMedication, updateMedication, deleteMedication, addDoctorVisit, updateDoctorVisit, deleteDoctorVisit, updateEpisode } = useIllnessStore();
  const [activeTab, setActiveTab] = useState<'records' | 'medications' | 'visits'>('records');
  const [modalType, setModalType] = useState<ModalType>(null);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editingMedId, setEditingMedId] = useState<string | null>(null);
  const [editingVisitId, setEditingVisitId] = useState<string | null>(null);
  const [recordForm, setRecordForm] = useState<RecordForm>(emptyRecord);
  const [medForm, setMedForm] = useState<MedicationForm>(emptyMedication);
  const [visitForm, setVisitForm] = useState<VisitForm>(emptyVisit);
  const [editTitle, setEditTitle] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const resolvedParams = use(params);

  useEffect(() => {
    fetchEpisode(resolvedParams.id);
  }, [fetchEpisode, resolvedParams.id]);

  const episode = currentEpisode;

  // Prepare chart data: records with temperature, sorted by recorded_at
  const chartData = useMemo(() => {
    if (!episode) return [];
    return episode.records
      .filter((r) => r.temperature !== undefined)
      .map((r) => ({
        time: format(parseISO(r.recorded_at), 'MM/dd HH:mm'),
        temperature: r.temperature,
      }))
      .sort((a, b) => {
        // Sort by actual datetime using episode records order? Better to sort by recorded_at
        const aTime = parseISO(episode.records.find(r => r.temperature === a.temperature && format(parseISO(r.recorded_at), 'MM/dd HH:mm') === a.time)?.recorded_at || '');
        const bTime = parseISO(episode.records.find(r => r.temperature === b.temperature && format(parseISO(r.recorded_at), 'MM/dd HH:mm') === b.time)?.recorded_at || '');
        return new Date(aTime).getTime() - new Date(bTime).getTime();
      });
  }, [episode]);

  const openRecordModal = useCallback((record?: IllnessRecord) => {
    if (record) {
      setEditingRecordId(record.id);
      const symptomsArray = Array.isArray(record.symptoms) ? record.symptoms : [record.symptoms].filter(Boolean);
      setRecordForm({
        recorded_at: record.recorded_at.slice(0, 16), // datetime-local format
        symptoms: symptomsArray.join(', '),
        temperature: record.temperature?.toString() || '',
        temperature_method: record.temperature_method || 'axillary',
        appetite: record.appetite || 'good',
        sleep_quality: record.sleep_quality || 'good',
        mood: record.mood || 'normal',
        notes: record.notes || '',
      });
    } else {
      setEditingRecordId(null);
      setRecordForm(emptyRecord);
    }
    setModalType('record');
  }, []);

  const openMedicationModal = useCallback((med?: Medication) => {
    if (med) {
      setEditingMedId(med.id);
      setMedForm({
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        route: med.route || 'oral',
        start_date: med.start_date,
        end_date: med.end_date || '',
        prescribed_by: med.prescribed_by || '',
        notes: med.notes || '',
      });
    } else {
      setEditingMedId(null);
      setMedForm(emptyMedication);
    }
    setModalType('medication');
  }, []);

  const openVisitModal = useCallback((visit?: DoctorVisit) => {
    if (visit) {
      setEditingVisitId(visit.id);
      const attachmentsArray = Array.isArray(visit.attachments) ? visit.attachments : visit.attachments ? [visit.attachments] : [];
      setVisitForm({
        visit_date: visit.visit_date.slice(0, 16),
        hospital: visit.hospital || '',
        department: visit.department || '',
        doctor: visit.doctor || '',
        diagnosis: visit.diagnosis || '',
        prescription: visit.prescription || '',
        advice: visit.advice || '',
        attachments: attachmentsArray.join(', '),
      });
    } else {
      setEditingVisitId(null);
      setVisitForm(emptyVisit);
    }
    setModalType('visit');
  }, []);

  const closeModal = useCallback(() => {
    setModalType(null);
    setEditingRecordId(null);
    setEditingMedId(null);
    setEditingVisitId(null);
    setRecordForm(emptyRecord);
    setMedForm(emptyMedication);
    setVisitForm(emptyVisit);
  }, []);

  const handleSaveRecord = async () => {
    if (!episode) return;
    const symptomsArray = recordForm.symptoms.split(',').map(s => s.trim()).filter(Boolean);
    const data: Omit<IllnessRecord, 'id' | 'episode_id'> = {
      recorded_at: new Date(recordForm.recorded_at).toISOString(),
      symptoms: symptomsArray,
      temperature: recordForm.temperature ? parseFloat(recordForm.temperature) : undefined,
      temperature_method: recordForm.temperature_method,
      appetite: recordForm.appetite,
      sleep_quality: recordForm.sleep_quality,
      mood: recordForm.mood,
      notes: recordForm.notes || undefined,
    };
    if (editingRecordId) {
      await updateRecord(episode.id, editingRecordId, data);
    } else {
      await addRecord(episode.id, data);
    }
    closeModal();
  };

  const handleSaveMedication = async () => {
    if (!episode) return;
    const data: Omit<Medication, 'id' | 'episode_id'> = {
      name: medForm.name,
      dosage: medForm.dosage,
      frequency: medForm.frequency,
      route: medForm.route,
      start_date: medForm.start_date,
      end_date: medForm.end_date || undefined,
      prescribed_by: medForm.prescribed_by || undefined,
      notes: medForm.notes || undefined,
    };
    if (editingMedId) {
      await updateMedication(episode.id, editingMedId, data);
    } else {
      await addMedication(episode.id, data);
    }
    closeModal();
  };

  const handleSaveVisit = async () => {
    if (!episode) return;
    const attachments = visitForm.attachments.split(',').map(s => s.trim()).filter(Boolean);
    const data: Omit<DoctorVisit, 'id' | 'episode_id'> = {
      visit_date: new Date(visitForm.visit_date).toISOString(),
      hospital: visitForm.hospital || undefined,
      department: visitForm.department || undefined,
      doctor: visitForm.doctor || undefined,
      diagnosis: visitForm.diagnosis || undefined,
      prescription: visitForm.prescription || undefined,
      advice: visitForm.advice || undefined,
      attachments: attachments.length > 0 ? attachments : undefined,
    };
    if (editingVisitId) {
      await updateDoctorVisit(episode.id, editingVisitId, data);
    } else {
      await addDoctorVisit(episode.id, data);
    }
    closeModal();
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!episode) return;
    if (confirm('确定删除这条记录吗？')) {
      await deleteRecord(episode.id, recordId);
    }
  };

  const handleDeleteMedication = async (medId: string) => {
    if (!episode) return;
    if (confirm('确定删除这条用药记录吗？')) {
      await deleteMedication(episode.id, medId);
    }
  };

  const handleDeleteVisit = async (visitId: string) => {
    if (!episode) return;
    if (confirm('确定删除这条就医记录吗？')) {
      await deleteDoctorVisit(episode.id, visitId);
    }
  };

  const handleEditEpisode = async () => {
    if (!episode) return;
    const updates: Partial<IllnessEpisode> = {
      title: editTitle,
      start_date: editStartDate,
      end_date: editEndDate || undefined,
      description: editDescription || undefined,
    };
    await updateEpisode(episode.id, updates);
    setEditingEpisode(false);
  };

  const [editingEpisode, setEditingEpisode] = useState(false);
  const initEditEpisode = () => {
    if (!episode) return;
    setEditTitle(episode.title);
    setEditStartDate(episode.start_date);
    setEditEndDate(episode.end_date || '');
    setEditDescription(episode.description || '');
    setEditingEpisode(true);
  };

  if (loading || !episode) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce-soft">⏳</div>
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  const endDateDisplay = episode.end_date || '（进行中）';
  const duration = episode.end_date
    ? `${differenceInDays(parseISO(episode.end_date), parseISO(episode.start_date)) + 1}天`
    : `${differenceInDays(new Date(), parseISO(episode.start_date)) + 1}天`;

  return (
    <div>
      <PageHeader title="生病详情" emoji="🤒" />

      {/* Episode Header Card */}
      <Card className="mb-6">
        <CardContent className="p-4">
          {editingEpisode ? (
            <div className="space-y-3">
              <Input label="标题" value={editTitle} onChange={setEditTitle} required />
              <div className="grid grid-cols-2 gap-3">
                <Input label="开始日期" type="date" value={editStartDate} onChange={setEditStartDate} required />
                <Input label="结束日期" type="date" value={editEndDate} onChange={setEditEndDate} />
              </div>
              <TextArea label="描述" value={editDescription} onChange={setEditDescription} />
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setEditingEpisode(false)}>取消</Button>
                <Button onClick={handleEditEpisode}>保存</Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">{episode.title}</h2>
                <div className="text-sm text-gray-500">
                  📅 {episode.start_date} ~ {endDateDisplay}（共{duration}）
                  {episode.description && <span className="ml-3">📄 {episode.description}</span>}
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={initEditEpisode}>编辑</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 pb-2">
        <button
          className={`px-4 py-2 font-medium rounded-t-lg ${activeTab === 'records' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('records')}
        >
          观察记录 ({episode.records.length})
        </button>
        <button
          className={`px-4 py-2 font-medium rounded-t-lg ${activeTab === 'medications' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('medications')}
        >
          用药记录 ({episode.medications.length})
        </button>
        <button
          className={`px-4 py-2 font-medium rounded-t-lg ${activeTab === 'visits' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('visits')}
        >
          就医记录 ({episode.doctor_visits.length})
        </button>
      </div>

      {/* Temperature Chart (only if enough data) */}
      {activeTab === 'records' && chartData.length >= 3 && (
        <Card className="mb-6">
          <CardHeader title="体温趋势" emoji="🌡️" />
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                  <YAxis domain={[35, 42]} tick={{ fontSize: 12 }} unit="°C" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="temperature" stroke="#ff7300" name="体温" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Records Section */}
      {activeTab === 'records' && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700">观察记录</h3>
            <Button onClick={() => openRecordModal()}>➕ 添加记录</Button>
          </div>
          {episode.records.length > 0 ? (
            <div className="space-y-3">
              {[...episode.records]
                .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())
                .map((record) => (
                  <Card key={record.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800 mb-1">
                            {format(parseISO(record.recorded_at), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                          </div>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {(Array.isArray(record.symptoms) ? record.symptoms : [record.symptoms].filter(Boolean)).map((symptom: string, idx: number) => (
                              <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">{symptom}</span>
                            ))}
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            {record.temperature !== undefined && (
                              <div>🌡️ 体温: {record.temperature.toFixed(1)}°C ({record.temperature_method})</div>
                            )}
                            <div>😊 食欲: {record.appetite === 'good' ? '好' : record.appetite === 'fair' ? '一般' : '差'}</div>
                            <div>🌙 睡眠: {record.sleep_quality === 'good' ? '好' : record.sleep_quality === 'fair' ? '一般' : '差'}</div>
                            <div>🧠 精神: {record.mood === 'normal' ? '正常' : record.mood === 'irritable' ? '烦躁' : '萎靡'}</div>
                            {record.notes && <div>📝 {record.notes}</div>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => openRecordModal(record)} className="text-blue-500 hover:text-blue-700 p-1">✏️</button>
                          <button onClick={() => handleDeleteRecord(record.id)} className="text-red-400 hover:text-red-600 p-1">🗑️</button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8 text-gray-400">
                <p>还没有观察记录</p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Medications Section */}
      {activeTab === 'medications' && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700">用药记录</h3>
            <Button onClick={() => openMedicationModal()}>➕ 添加用药</Button>
          </div>
          {episode.medications.length > 0 ? (
            <div className="space-y-3">
              {episode.medications.map((med) => (
                <Card key={med.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800 mb-1">{med.name} - {med.dosage}</div>
                        <div className="text-sm text-gray-600">
                          <div>🕒 频率: {med.frequency}</div>
                          <div>📅 开始: {med.start_date}{med.end_date ? ` ~ ${med.end_date}` : ''}</div>
                          {med.prescribed_by && <div>👨‍⚕️ 医生: {med.prescribed_by}</div>}
                          {med.notes && <div>📝 {med.notes}</div>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openMedicationModal(med)} className="text-blue-500 hover:text-blue-700 p-1">✏️</button>
                        <button onClick={() => handleDeleteMedication(med.id)} className="text-red-400 hover:text-red-600 p-1">🗑️</button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8 text-gray-400">
                <p>还没有用药记录</p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Doctor Visits Section */}
      {activeTab === 'visits' && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700">就医记录</h3>
            <Button onClick={() => openVisitModal()}>➕ 添加就医</Button>
          </div>
          {episode.doctor_visits.length > 0 ? (
            <div className="space-y-3">
              {episode.doctor_visits
                .sort((a, b) => new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime())
                .map((visit) => (
                  <Card key={visit.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800 mb-1">
                            {format(parseISO(visit.visit_date), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                            {visit.hospital && ` · ${visit.hospital}`}
                            {visit.department && ` (${visit.department})`}
                          </div>
                          {visit.doctor && <div className="text-sm text-gray-600 mb-1">👨‍⚕️ {visit.doctor}</div>}
                          {visit.diagnosis && <div className="text-sm font-medium text-red-600 mb-1">诊断: {visit.diagnosis}</div>}
                          {visit.prescription && <div className="text-sm text-gray-600 mb-1">💊 处方: {visit.prescription}</div>}
                          {visit.advice && <div className="text-sm text-gray-600 mb-1">💡 建议: {visit.advice}</div>}
                          {visit.attachments && Array.isArray(visit.attachments) && visit.attachments.length > 0 && (
                            <div className="text-sm text-gray-500">
                              📎 附件: {visit.attachments.map((url: string, i: number) => (
                                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">查看{i < (visit.attachments?.length ?? 0) - 1 ? ',' : ''}</a>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => openVisitModal(visit)} className="text-blue-500 hover:text-blue-700 p-1">✏️</button>
                          <button onClick={() => handleDeleteVisit(visit.id)} className="text-red-400 hover:text-red-600 p-1">🗑️</button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8 text-gray-400">
                <p>还没有就医记录</p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Record Modal */}
      <Modal
        isOpen={modalType === 'record'}
        onClose={closeModal}
        title={editingRecordId ? '编辑记录' : '添加观察记录'}
      >
        <div className="space-y-4">
          <Input
            label="记录时间"
            type="datetime-local"
            value={recordForm.recorded_at}
            onChange={(v) => setRecordForm(f => ({ ...f, recorded_at: v }))}
            required
          />
          <Input
            label="症状（用逗号分隔）"
            value={recordForm.symptoms}
            onChange={(v) => setRecordForm(f => ({ ...f, symptoms: v }))}
            placeholder="例：发烧,咳嗽,流涕"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="体温 (°C)"
              type="number"
              step={0.1}
              min={35}
              max={42}
              value={recordForm.temperature}
              onChange={(v) => setRecordForm(f => ({ ...f, temperature: v }))}
              placeholder="可选"
            />
            <Select
              label="测量方式"
              value={recordForm.temperature_method}
              onChange={(v) => setRecordForm(f => ({ ...f, temperature_method: v as TemperatureMethod }))}
              options={[
                { value: 'axillary', label: '腋下' },
                { value: 'oral', label: '口腔' },
                { value: 'ear', label: '耳温' },
                { value: 'temporal', label: '额温' },
              ]}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Select
              label="食欲"
              value={recordForm.appetite}
              onChange={(v) => setRecordForm(f => ({ ...f, appetite: v as AppetiteLevel }))}
              options={[
                { value: 'good', label: '好' },
                { value: 'fair', label: '一般' },
                { value: 'poor', label: '差' },
              ]}
            />
            <Select
              label="睡眠"
              value={recordForm.sleep_quality}
              onChange={(v) => setRecordForm(f => ({ ...f, sleep_quality: v as SleepQualityLevel }))}
              options={[
                { value: 'good', label: '好' },
                { value: 'fair', label: '一般' },
                { value: 'poor', label: '差' },
              ]}
            />
            <Select
              label="精神"
              value={recordForm.mood}
              onChange={(v) => setRecordForm(f => ({ ...f, mood: v as MoodLevel }))}
              options={[
                { value: 'normal', label: '正常' },
                { value: 'irritable', label: '烦躁' },
                { value: 'lethargic', label: '萎靡' },
              ]}
            />
          </div>
          <TextArea
            label="备注"
            value={recordForm.notes}
            onChange={(v) => setRecordForm(f => ({ ...f, notes: v }))}
            placeholder="其他情况..."
          />
          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={closeModal} fullWidth>取消</Button>
            <Button onClick={handleSaveRecord} fullWidth>保存</Button>
          </div>
        </div>
      </Modal>

      {/* Medication Modal */}
      <Modal
        isOpen={modalType === 'medication'}
        onClose={closeModal}
        title={editingMedId ? '编辑用药记录' : '添加用药记录'}
      >
        <div className="space-y-4">
          <Input label="药品名称" value={medForm.name} onChange={(v) => setMedForm(f => ({ ...f, name: v }))} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="剂量" value={medForm.dosage} onChange={(v) => setMedForm(f => ({ ...f, dosage: v }))} required />
            <Input label="频率" value={medForm.frequency} onChange={(v) => setMedForm(f => ({ ...f, frequency: v }))} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="给药途径"
              value={medForm.route}
              onChange={(v) => setMedForm(f => ({ ...f, route: v as MedicationRoute }))}
              options={[
                { value: 'oral', label: '口服' },
                { value: 'topical', label: '外用' },
                { value: 'injection', label: '注射' },
              ]}
            />
            <Input label="医生" value={medForm.prescribed_by} onChange={(v) => setMedForm(f => ({ ...f, prescribed_by: v }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="开始日期" type="date" value={medForm.start_date} onChange={(v) => setMedForm(f => ({ ...f, start_date: v }))} required />
            <Input label="结束日期" type="date" value={medForm.end_date} onChange={(v) => setMedForm(f => ({ ...f, end_date: v }))} />
          </div>
          <TextArea
            label="备注"
            value={medForm.notes}
            onChange={(v) => setMedForm(f => ({ ...f, notes: v }))}
            placeholder="如：饭后服用..."
          />
          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={closeModal} fullWidth>取消</Button>
            <Button onClick={handleSaveMedication} fullWidth>保存</Button>
          </div>
        </div>
      </Modal>

      {/* Visit Modal */}
      <Modal
        isOpen={modalType === 'visit'}
        onClose={closeModal}
        title={editingVisitId ? '编辑就医记录' : '添加就医记录'}
      >
        <div className="space-y-4">
          <Input
            label="就诊时间"
            type="datetime-local"
            value={visitForm.visit_date}
            onChange={(v) => setVisitForm(f => ({ ...f, visit_date: v }))}
            required
          />
          <Input label="医院" value={visitForm.hospital} onChange={(v) => setVisitForm(f => ({ ...f, hospital: v }))} />
          <Input label="科室" value={visitForm.department} onChange={(v) => setVisitForm(f => ({ ...f, department: v }))} />
          <Input label="医生" value={visitForm.doctor} onChange={(v) => setVisitForm(f => ({ ...f, doctor: v }))} />
          <TextArea label="诊断结果" value={visitForm.diagnosis} onChange={(v) => setVisitForm(f => ({ ...f, diagnosis: v }))} />
          <TextArea label="处方" value={visitForm.prescription} onChange={(v) => setVisitForm(f => ({ ...f, prescription: v }))} />
          <TextArea label="医生建议" value={visitForm.advice} onChange={(v) => setVisitForm(f => ({ ...f, advice: v }))} />
          <Input label="附件链接（逗号分隔）" value={visitForm.attachments} onChange={(v) => setVisitForm(f => ({ ...f, attachments: v }))} />
          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={closeModal} fullWidth>取消</Button>
            <Button onClick={handleSaveVisit} fullWidth>保存</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
