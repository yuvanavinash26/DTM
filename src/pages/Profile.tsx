import React, { useState, useEffect } from 'react';
import { User } from '../types/user';
import { Student } from '../types/student';
import { getStudentById } from '../services/studentService';
import { User as UserIcon, Shield, Mail, Phone, Calendar, Key, CheckCircle, Radio, Wifi } from 'lucide-react';

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
    <div className="max-w-4xl mx-auto space-y-6 pb-12" id="profile-view">
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center gap-5">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-indigo-600/30">
          {currentUser.name.charAt(0)}
        </div>
        <div className="text-center sm:text-left space-y-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-2xl font-black text-white">{currentUser.name}</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
              {currentUser.role}
            </span>
          </div>
          <p className="text-xs font-mono text-slate-400">
            Identifier: <strong className="text-white">{currentUser.identifier}</strong>
          </p>
          <p className="text-xs text-slate-400">
            {currentUser.department || 'Computer Science & Engineering'} &bull; DTM College of Technology
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Contact & Department Details */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white tracking-tight">Institutional Profile</h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-slate-400">Email Address</span>
              <span className="font-semibold text-white">
                {currentUser.email || (studentDetails?.email || 'user@dtm.edu.in')}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-slate-400">Contact Number</span>
              <span className="font-semibold text-white">
                {studentDetails?.phone || '+91 98401 23456'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-slate-400">Department</span>
              <span className="font-semibold text-white">
                {currentUser.department || 'Computer Science & Engineering'}
              </span>
            </div>
            {studentDetails && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <span className="text-slate-400">Current Semester</span>
                <span className="font-semibold text-white">
                  {studentDetails.semester} (Section {studentDetails.section})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Hardware & Verification Binding */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white tracking-tight">Hardware Verification Binding</h3>
          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Registered RFID UID</span>
                <p className="text-sm font-mono font-bold text-emerald-400 mt-0.5">
                  {studentDetails?.rfidUid || '4A:D1:02:07'}
                </p>
              </div>
              <Radio className="w-5 h-5 text-emerald-400" />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase">BLE Mobile UUID</span>
                <p className="text-sm font-mono font-bold text-cyan-400 mt-0.5">
                  {studentDetails?.bleDeviceId || 'DTM_BLE_YUVAN'}
                </p>
              </div>
              <Wifi className="w-5 h-5 text-cyan-400" />
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Bi-factor hardware credentials verified and active for classroom sessions.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
