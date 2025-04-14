import React, { useContext, useEffect, useState } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';

const DoctorDashboard = () => {
  const { dToken, dashData, getDashData, cancelAppointment, completeAppointment } = useContext(DoctorContext);
  const { slotDateFormat, currency } = useContext(AppContext);

  const [completedAppointments, setCompletedAppointments] = useState({});

  useEffect(() => {
    if (dToken) {
      getDashData();
    }
  }, [dToken]);

  const handleCompleteAppointment = (id) => {
    completeAppointment(id);
    setCompletedAppointments(prev => ({ ...prev, [id]: true }));
  };

  return dashData && (
    <div className='m-5'>
      {/* Top Cards */}
      <div className='flex flex-wrap gap-3'>
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.earning_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{currency} {dashData.earnings}</p>
            <p className='text-gray-400'>Earnings</p>
          </div>
        </div>
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.appointments_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{dashData.appointments}</p>
            <p className='text-gray-400'>Appointments</p>
          </div>
        </div>
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.patients_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{dashData.patients}</p>
            <p className='text-gray-400'>Patients</p>
          </div>
        </div>
      </div>

      {/* Latest Bookings */}
      <div className='bg-white'>
        <div className='flex items-center gap-2.5 px-4 py-4 mt-10 rounded-t border'>
          <img src={assets.list_icon} alt="" />
          <p className='font-semibold'>Latest Bookings</p>
        </div>

        <div className='pt-4 border border-t-0'>
          {dashData.latestAppointments.slice(0, 5).map((item, index) => (
            <div className='flex flex-col gap-1 px-6 py-3 hover:bg-gray-100' key={index}>
              <div className='flex items-center gap-3'>
                <img className='rounded-full w-10' src={item.userData.image} alt="" />
                <div className='flex-1 text-sm'>
                  <p className='text-gray-800 font-medium'>{item.userData.name}</p>
                  <p className='text-gray-600 '>Booking on {slotDateFormat(item.slotDate)}</p>
                </div>
                {item.cancelled ? (
                  <p className='text-red-400 text-xs font-medium'>Cancelled</p>
                ) : item.isCompleted || completedAppointments[item._id] ? (
                  <div className='text-green-500 text-xs font-medium'>
                    Completed
                    <div>
                      <a
                        href="https://meet.google.com/ahz-gchc-zjy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className='block text-blue-500 underline text-xs mt-1'
                      >
                        Join Meeting
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className='flex gap-2'>
                    <img
                      onClick={() => cancelAppointment(item._id)}
                      className='w-8 cursor-pointer'
                      src={assets.cancel_icon}
                      alt="Cancel"
                    />
                    <img
                      onClick={() => handleCompleteAppointment(item._id)}
                      className='w-8 cursor-pointer'
                      src={assets.tick_icon}
                      alt="Complete"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
