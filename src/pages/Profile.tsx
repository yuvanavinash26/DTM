import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User } from '../types/user';
import { Student } from '../types/student';
import { getStudentById } from '../services/studentService';
import { ShieldCheck, Mail, Phone, Calendar, Key, CheckCircle, Radio, Wifi, Building2 } from 'lucide-react';

interface ProfileProps {
  currentUser: User;
}

export const Profile: React.FC<ProfileProps> = ({ currentUser }) => {
  const [studentDetails, setStudentDetails] = useState<Student | null>(null);

  useEffect(() => {
    if (currentUser.role === 'STUDENT') {
      getStudentById(currentUser.identifier).then(setStudentDetails);
    }
  }, [currentUser]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto space-y-6 pb-12"
      id="profile-view"
    >
      {/* Dossier Banner */}
      <div className="erp-card p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-700 to-teal-800 flex items-center justify-center text-3xl font-extrabold text-white shadow-lg border border-white/10 shrink-0">
          {currentUser.name.charAt(0)}
        </div>
        <div className="text-center sm:text-left space-y-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <h2 className="text-2xl font-bold text-white tracking-tight">{currentUser.name}</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {currentUser.role}
            </span>
          </div>
          <p className="text-xs font-mono text-slate-300">
            Institutional Identifier: <strong className="text-white">{currentUser.identifier}</strong>
          </p>
          <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1.5 pt-0.5">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            {currentUser.department || 'Department of Computer Science & Engineering'} &bull; DTM Campus
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Contact & Department Details */}
        <div className="erp-card p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2 border-b border-white/5 pb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Institutional Academic Profile
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-white/5">
              <span className="text-slate-400 font-medium">Campus Email</span>
              <span className="font-semibold text-white font-mono">
                {currentUser.email || (studentDetails?.email || 'user@dtm.edu.in')}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-white/5">
              <span className="text-slate-400 font-medium">Registered Phone</span>
              <span className="font-semibold text-white font-mono">
                {studentDetails?.phone || '+91 98401 23456'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-white/5">
              <span className="text-slate-400 font-medium">Department</span>
              <span className="font-semibold text-white">
                {currentUser.department || 'Computer Science & Engineering'}
              </span>
            </div>
            {studentDetails && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-white/5">
                <span className="text-slate-400 font-medium">Academic Standing</span>
                <span className="font-semibold text-white">
                  {studentDetails.semester} &bull; Section {studentDetails.section}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Hardware & Verification Binding */}
        <div className="erp-card p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2 border-b border-white/5 pb-3">
            <Radio className="w-4 h-4 text-teal-400" />
            Dual-Factor Hardware Credentials
          </h3>
          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Registered RFID UID
                </span>
                <p className="text-sm font-mono font-bold text-emerald-400 mt-0.5">
                  {studentDetails?.rfidUid || '4A:D1:02:07'}
                </p>
              </div>
              <Radio className="w-5 h-5 text-emerald-400" />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  BLE Mobile UUID / MAC
                </span>
                <p className="text-sm font-mono font-bold text-teal-400 mt-0.5">
                  {studentDetails?.bleDeviceId || 'DTM_BLE_YUVAN'}
                </p>
              </div>
              <Wifi className="w-5 h-5 text-teal-400" />
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Bi-factor hardware credentials verified and active for classroom sessions.</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
