'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { axiosInstance } from '@/lib/axios';

const SERVICE_TASKS = {
  'General Service': ['Oil Change', 'Brake check', 'Brake fluid change', 'Throttle body cleaning', 'Chain lubrication', 'Air filter cleaning', 'Battery check', 'Spark plug inspection'],
  Repair: ['Brake repair', 'Clutch repair', 'Engine tuning', 'Suspension repair', 'Electrical diagnosis', 'Carrier repair', 'Headlight repair'],
  Emission: ['Emission test', 'Catalytic converter check', 'Oxygen sensor check', 'Fuel injection cleaning', 'Exhaust leak inspection'],
  Insurance: ['Insurance renewal', 'Claim inspection', 'Document verification', 'Policy update', 'Premium payment'],
  Others: ['Roadside assistance', 'Accessory install', 'Tire replacement', 'Battery replacement', 'Custom service', 'Wash & polish']
};

const mapVehicle = (vehicle) => ({ ...vehicle, id: vehicle._id });
const mapService = (service) => ({ ...service, id: service._id, vehicleId: String(service.vehicleId) });
const mapServiceType = (type) => ({ ...type, id: type._id });


const ServiceCarePage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [services, setServices] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isServiceTypeModalOpen, setIsServiceTypeModalOpen] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState(null);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [editingServiceTypeId, setEditingServiceTypeId] = useState(null);
  const [vehicleForm, setVehicleForm] = useState({ name: '', model: '', year: '', registration: '' });
  const [serviceForm, setServiceForm] = useState({ vehicleId: '', type: '', date: new Date().toISOString().split('T')[0], amount: '', showroom: false, tasks: [], details: '' });
  const [serviceTypeForm, setServiceTypeForm] = useState({ name: '', taskInput: '', tasks: [] });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteType, setDeleteType] = useState(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);

  useEffect(() => {
    const fetchServiceCareData = async () => {
      try {
        const [vehiclesRes, servicesRes, typesRes] = await Promise.all([
          axiosInstance.get('/servicecare/vehicles'),
          axiosInstance.get('/servicecare/services'),
          axiosInstance.get('/servicecare/types')
        ]);

        const fetchedVehicles = vehiclesRes.data.map(mapVehicle);
        const fetchedServices = servicesRes.data.map(mapService);
        const fetchedTypes = typesRes.data.map(mapServiceType);

        setVehicles(fetchedVehicles);
        setServices(fetchedServices);
        setServiceTypes(fetchedTypes);
        setSelectedVehicleId((prev) => prev || fetchedVehicles[0]?.id || null);
      } catch (error) {
        console.error('Failed to load service care data', error);
        toast.error(error?.response?.data?.message || 'Unable to load service care data.');
      }
    };

    fetchServiceCareData();
  }, []);

  useEffect(() => {
    if (!vehicles.length) return;
    setSelectedVehicleId((prev) => prev ?? vehicles[0].id);
  }, [vehicles]);

  const selectedVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === selectedVehicleId) || null,
    [vehicles, selectedVehicleId]
  );

  const selectedVehicleServices = useMemo(() => {
    const list = selectedVehicleId
      ? services.filter((service) => String(service.vehicleId) === String(selectedVehicleId))
      : services;
    return [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [services, selectedVehicleId]);

  const filteredServices = selectedVehicleServices;

  const totalSpent = useMemo(
    () => selectedVehicleServices.reduce((sum, service) => sum + Number(service.amount || 0), 0),
    [selectedVehicleServices]
  );

  const lastOilChange = useMemo(() => {
    const oilServices = selectedVehicleServices.filter((service) => service.tasks?.includes('Oil Change'));
    if (!oilServices.length) return null;
    return oilServices.reduce((latest, service) => (new Date(service.date) > new Date(latest.date) ? service : latest)).date;
  }, [selectedVehicleServices]);

  const lastShowroomService = useMemo(() => {
    const showroomServices = selectedVehicleServices.filter((service) => service.showroom);
    if (!showroomServices.length) return null;
    return showroomServices.reduce((latest, service) => (new Date(service.date) > new Date(latest.date) ? service : latest)).date;
  }, [selectedVehicleServices]);

  const currentServiceTypeTasks = useMemo(() => {
    const selectedType = serviceTypes.find((type) => type.name === serviceForm.type);
    return selectedType?.tasks || [];
  }, [serviceForm.type, serviceTypes]);

  const resetVehicleForm = () => {
    setVehicleForm({ name: '', model: '', year: '', registration: '' });
    setEditingVehicleId(null);
  };

  const resetServiceForm = () => {
    setServiceForm({
      vehicleId: selectedVehicleId ?? vehicles[0]?.id ?? '',
      type: serviceTypes[0]?.name || '',
      date: new Date().toISOString().split('T')[0],
      amount: '',
      showroom: false,
      tasks: [],
      details: ''
    });
    setEditingServiceId(null);
  };

  const resetServiceTypeForm = () => {
    setServiceTypeForm({ name: '', taskInput: '', tasks: [] });
    setEditingServiceTypeId(null);
  };

  const openVehicleModal = (vehicle = null) => {
    if (vehicle) {
      setEditingVehicleId(vehicle.id);
      setVehicleForm({ name: vehicle.name, model: vehicle.model, year: vehicle.year, registration: vehicle.registration });
    } else {
      resetVehicleForm();
    }
    setIsVehicleModalOpen(true);
  };

  const openServiceModal = (service = null) => {
    if (service) {
      setEditingServiceId(service.id);
      setServiceForm({
        vehicleId: service.vehicleId,
        type: service.type,
        date: service.date,
        amount: service.amount.toString(),
        showroom: service.showroom,
        tasks: service.tasks ?? [],
        details: service.details
      });
    } else {
      resetServiceForm();
    }
    setIsServiceModalOpen(true);
  };

  const openServiceTypeModal = (serviceType = null) => {
    if (serviceType) {
      setEditingServiceTypeId(serviceType.id);
      setServiceTypeForm({ name: serviceType.name, taskInput: '', tasks: [...serviceType.tasks] });
    } else {
      resetServiceTypeForm();
    }
    setIsServiceTypeModalOpen(true);
  };

  const handleVehicleSubmit = async (event) => {
    event.preventDefault();
    const trimmedName = vehicleForm.name.trim();
    if (!trimmedName) {
      toast.error('Please enter a vehicle name.');
      return;
    }

    try {
      if (editingVehicleId) {
        const response = await axiosInstance.put(`/servicecare/vehicles/${editingVehicleId}`, {
          name: trimmedName,
          model: vehicleForm.model,
          year: vehicleForm.year,
          registration: vehicleForm.registration
        });

        const updatedVehicle = mapVehicle(response.data);
        setVehicles((prev) => prev.map((vehicle) => (String(vehicle.id) === String(editingVehicleId) ? updatedVehicle : vehicle)));
        toast.success('Vehicle updated.');
      } else {
        const response = await axiosInstance.post('/servicecare/vehicles', {
          name: trimmedName,
          model: vehicleForm.model,
          year: vehicleForm.year,
          registration: vehicleForm.registration
        });

        const newVehicle = mapVehicle(response.data);
        setVehicles((prev) => [newVehicle, ...prev]);
        setSelectedVehicleId(newVehicle.id);
        toast.success('Vehicle added.');
      }

      setIsVehicleModalOpen(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to save vehicle.');
    }
  };

  const handleServiceSubmit = async (event) => {
    event.preventDefault();
    if (!serviceForm.vehicleId) {
      toast.error('Please select a vehicle.');
      return;
    }

    if (!serviceForm.type) {
      toast.error('Please select a service type.');
      return;
    }

    const amountValue = parseFloat(serviceForm.amount);
    if (Number.isNaN(amountValue) || amountValue < 0) {
      toast.error('Enter a valid amount.');
      return;
    }

    const payload = {
      vehicleId: serviceForm.vehicleId,
      type: serviceForm.type,
      date: serviceForm.date,
      amount: amountValue,
      showroom: serviceForm.showroom,
      tasks: serviceForm.tasks,
      details: serviceForm.details.trim()
    };

    try {
      if (editingServiceId) {
        const response = await axiosInstance.put(`/servicecare/services/${editingServiceId}`, payload);
        const updatedService = mapService(response.data);
        setServices((prev) => prev.map((service) => (service.id === editingServiceId ? updatedService : service)));
        toast.success('Service updated.');
      } else {
        const response = await axiosInstance.post('/servicecare/services', payload);
        setServices((prev) => [mapService(response.data), ...prev]);
        toast.success('Service record added.');
      }

      setIsServiceModalOpen(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to save service record.');
    }
  };

  const handleServiceTypeSubmit = async (event) => {
    event.preventDefault();
    const trimmedName = serviceTypeForm.name.trim();
    if (!trimmedName) {
      toast.error('Please enter a service type name.');
      return;
    }

    if (!serviceTypeForm.tasks.length) {
      toast.error('Please add at least one task.');
      return;
    }

    const duplicate = serviceTypes.find(
      (type) => type.name.toLowerCase() === trimmedName.toLowerCase() && type.id !== editingServiceTypeId
    );
    if (duplicate) {
      toast.error('A service type with this name already exists.');
      return;
    }

    try {
      if (editingServiceTypeId) {
        const response = await axiosInstance.put(`/servicecare/types/${editingServiceTypeId}`, {
          name: trimmedName,
          tasks: serviceTypeForm.tasks
        });

        const updatedType = mapServiceType(response.data);
        const oldType = serviceTypes.find((type) => type.id === editingServiceTypeId);
        setServiceTypes((prev) => prev.map((type) => (type.id === editingServiceTypeId ? updatedType : type)));

        if (oldType) {
          setServices((prev) => prev.map((service) =>
            service.type === oldType.name ? { ...service, type: trimmedName } : service
          ));
          setServiceForm((prev) => (prev.type === oldType.name ? { ...prev, type: trimmedName } : prev));
        }

        toast.success('Service type updated.');
      } else {
        const response = await axiosInstance.post('/servicecare/types', {
          name: trimmedName,
          tasks: serviceTypeForm.tasks
        });

        setServiceTypes((prev) => [mapServiceType(response.data), ...prev]);
        toast.success('Service type added.');
      }

      setIsServiceTypeModalOpen(false);
      resetServiceTypeForm();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to save service type.');
    }
  };

  const handleDeleteServiceType = async (serviceType) => {
    try {
      await axiosInstance.delete(`/servicecare/types/${serviceType.id}`);
      const remainingTypes = serviceTypes.filter((type) => type.id !== serviceType.id);
      const fallbackTypeName = remainingTypes[0]?.name || '';

      setServiceTypes(remainingTypes);
      setServices((prev) => prev.map((service) =>
        service.type === serviceType.name ? { ...service, type: fallbackTypeName } : service
      ));
      toast.success('Service type removed.');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to remove service type.');
    }
  };

  const openDeleteModal = (item, type) => {
    setDeleteTarget(item);
    setDeleteType(type);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget || !deleteType) {
      setIsDeleteModalOpen(false);
      return;
    }

    try {
      if (deleteType === 'vehicle') {
        await axiosInstance.delete(`/servicecare/vehicles/${deleteTarget.id}`);
        const removedVehicleId = deleteTarget.id;
        setVehicles((prev) => prev.filter((vehicle) => vehicle.id !== removedVehicleId));
        setServices((prev) => prev.filter((service) => service.vehicleId !== removedVehicleId));
        if (selectedVehicleId === removedVehicleId) {
          const nextVehicle = vehicles.find((vehicle) => vehicle.id !== removedVehicleId);
          setSelectedVehicleId(nextVehicle?.id ?? null);
        }
        toast.success('Vehicle removed.');
      } else {
        await axiosInstance.delete(`/servicecare/services/${deleteTarget.id}`);
        setServices((prev) => prev.filter((service) => service.id !== deleteTarget.id));
        toast.success('Service removed.');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to delete record.');
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
      setDeleteType(null);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  const formatDate = (date) => new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-10 font-sans">
      <div className="max-w-7xl mx-auto grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-6 rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-lg">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Service Care</p>
            <h1 className="text-3xl font-black text-white">Bike Service Dashboard</h1>
            <p className="text-sm text-slate-400">Manage records, bikes, and service types from a clean sidebar.</p>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => openServiceModal()}
              className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Add service
            </button>
            <button
              type="button"
              onClick={() => openVehicleModal()}
              className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
            >
              Add vehicle
            </button>
            <button
              type="button"
              onClick={() => openServiceTypeModal()}
              className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
            >
              Manage service types
            </button>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Snapshot</p>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <div className="flex items-center justify-between">
                <span>Bikes</span>
                <span className="font-semibold text-white">{vehicles.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Types</span>
                <span className="font-semibold text-white">{serviceTypes.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Records</span>
                <span className="font-semibold text-white">{filteredServices.length}</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="space-y-8">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-lg">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Total spent</p>
              <p className="mt-4 text-3xl font-black text-white">{formatCurrency(totalSpent)}</p>
              <p className="mt-2 text-sm text-slate-400">Across all vehicle services</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-lg">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Last oil change</p>
              <p className="mt-4 text-2xl font-black text-white">{lastOilChange ? formatDate(lastOilChange) : 'No record'}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-lg">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Last showroom service</p>
              <p className="mt-4 text-2xl font-black text-white">{lastShowroomService ? formatDate(lastShowroomService) : 'No record'}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-lg">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Service records</p>
              <p className="mt-4 text-3xl font-black text-white">{filteredServices.length}</p>
              <p className="mt-2 text-sm text-slate-400">{selectedVehicle ? 'Showing service history for the selected bike' : 'Select a bike to filter service records'}</p>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-lg">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Service types</p>
                  <h2 className="mt-3 text-3xl font-black text-white">Defined categories</h2>
                </div>
                <button
                  onClick={() => openServiceTypeModal()}
                  className="rounded-3xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-500"
                >
                  Add type
                </button>
              </div>

              <div className="mt-6 space-y-4">
                {serviceTypes.length ? (
                  serviceTypes.map((type) => (
                    <div key={type.id} className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-lg">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{type.name}</p>
                          <p className="mt-2 text-sm text-slate-400">{type.tasks.length} task{type.tasks.length === 1 ? '' : 's'}</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => openServiceTypeModal(type)}
                            className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm uppercase tracking-[0.18em] text-blue-300 hover:bg-slate-800"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteServiceType(type)}
                            className="rounded-2xl border border-red-600 bg-slate-900 px-4 py-3 text-sm uppercase tracking-[0.18em] text-red-400 hover:bg-slate-800"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950 p-8 text-center text-slate-400">
                    <p className="text-lg font-bold text-slate-100">No service categories found.</p>
                    <p className="mt-2 text-sm text-slate-400">Create a service type to start adding services.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-lg">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Bike filter</p>
                  <h2 className="mt-3 text-3xl font-black text-white">
                    {selectedVehicle ? selectedVehicle.name : 'No bikes available'}
                  </h2>
                  <p className="mt-2 text-sm text-slate-400">
                    {selectedVehicle
                      ? `${selectedVehicle.model} • ${selectedVehicle.year}`
                      : 'Add a bike to start tracking service.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openVehicleModal()}
                  className="rounded-3xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
                >
                  Add bike
                </button>
              </div>

              {vehicles.length ? (
                <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-900 p-4">
                  <label className="block text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Select bike
                  </label>
                  <select
                    value={selectedVehicleId ?? ''}
                    onChange={(event) => setSelectedVehicleId(event.target.value)}
                    className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id} className="bg-slate-950 text-slate-100">
                        {vehicle.name} • {vehicle.model}
                      </option>
                    ))}
                  </select>

                  {selectedVehicle && (
                    <div className="mt-4 grid gap-3 text-sm text-slate-300">
                      <div className="rounded-3xl border border-slate-700 bg-slate-900 p-4">
                        <p className="text-slate-400">Registration</p>
                        <p className="mt-1 text-white">{selectedVehicle.registration}</p>
                      </div>
                      <div className="rounded-3xl border border-slate-700 bg-slate-900 p-4">
                        <p className="text-slate-400">Service records</p>
                        <p className="mt-1 text-white">{selectedVehicleServices.length}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-lg">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Service overview</p>
                <h2 className="mt-3 text-3xl font-black text-white">History and records</h2>
              </div>
              <div className="rounded-3xl bg-slate-900 px-5 py-3 text-sm font-bold uppercase tracking-[0.2em] text-slate-300">
                {selectedVehicle ? `Viewing ${selectedVehicle.name}` : 'Select a bike'}
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-lg">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Service records</p>
                  <h2 className="mt-3 text-3xl font-black text-white">Service history</h2>
                </div>
                <button
                  onClick={() => openServiceModal()}
                  className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-500"
                >
                  <Plus size={18} /> Add record
                </button>
              </div>

              {filteredServices.length ? (
                <div className="space-y-4">
                  {filteredServices.map((service) => {
                    const vehicle = vehicles.find((item) => item.id === service.vehicleId);
                    return (
                      <div key={service.id} className="rounded-3xl border border-slate-800 bg-slate-950 p-5 shadow-lg">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{service.type}</p>
                            <h3 className="mt-2 text-xl font-black text-white">{vehicle?.name || 'Unknown bike'}</h3>
                            <p className="mt-1 text-sm text-slate-400">{formatDate(service.date)} • {vehicle?.registration || 'No registration'}</p>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="rounded-2xl bg-slate-900/80 px-3 py-2 text-slate-100">{formatCurrency(service.amount)}</span>
                            {service.showroom && <span className="rounded-2xl bg-emerald-900/70 px-3 py-2 text-emerald-300">Showroom</span>}
                          </div>
                        </div>
                        {service.tasks?.length ? (
                          <div className="mt-4 rounded-3xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-400">
                            <p className="font-semibold text-slate-100">Tasks completed</p>
                            <ul className="mt-2 list-inside list-disc space-y-1">
                              {service.tasks.map((task) => (
                                <li key={task}>{task}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                        {service.details && <p className="mt-4 text-slate-400">{service.details}</p>}
                        <div className="mt-5 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => openServiceModal(service)}
                            className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm uppercase tracking-[0.18em] text-blue-300 hover:bg-slate-800"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => openDeleteModal(service, 'service')}
                            className="rounded-2xl border border-red-600 bg-slate-900 px-4 py-3 text-sm uppercase tracking-[0.18em] text-red-400 hover:bg-slate-800"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900 p-8 text-center text-slate-400">
                  <p className="text-lg font-bold text-slate-100">No service records found.</p>
                  <p className="mt-2 text-sm text-slate-400">Add your first service record to keep a history of maintenance and expenses.</p>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>

      {isVehicleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80">
          <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-950 p-8 shadow-xl">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Vehicle</p>
                <h2 className="mt-2 text-3xl font-black text-white">{editingVehicleId ? 'Edit vehicle' : 'Add new bike'}</h2>
              </div>
            </div>

            <form onSubmit={handleVehicleSubmit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-300">
                  <span>Name</span>
                  <input
                    value={vehicleForm.name}
                    onChange={(event) => setVehicleForm((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="Royal Enfield"
                    className="w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  <span>Model</span>
                  <input
                    value={vehicleForm.model}
                    onChange={(event) => setVehicleForm((prev) => ({ ...prev, model: event.target.value }))}
                    placeholder="Classic 350"
                    className="w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-300">
                  <span>Year</span>
                  <input
                    value={vehicleForm.year}
                    onChange={(event) => setVehicleForm((prev) => ({ ...prev, year: event.target.value }))}
                    placeholder="2022"
                    className="w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  <span>Registration</span>
                  <input
                    value={vehicleForm.registration}
                    onChange={(event) => setVehicleForm((prev) => ({ ...prev, registration: event.target.value }))}
                    placeholder="KA05AB1234"
                    className="w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </label>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsVehicleModalOpen(false)}
                  className="rounded-3xl border border-slate-700 bg-slate-900 px-6 py-3 text-sm font-bold text-slate-100 transition hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-3xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-500"
                >
                  {editingVehicleId ? 'Save Vehicle' : 'Add Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 overflow-auto">
          <div className="w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-950 p-8 shadow-xl max-h-[calc(100vh-3rem)] overflow-y-auto">
            <div className="mb-6">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Service record</p>
              <h2 className="mt-2 text-3xl font-black text-white">{editingServiceId ? 'Edit service' : 'Add new service'}</h2>
            </div>

            <form onSubmit={handleServiceSubmit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-300">
                  <span>Bike</span>
                  <select
                    value={serviceForm.vehicleId}
                    onChange={(event) => setServiceForm((prev) => ({ ...prev, vehicleId: event.target.value }))}
                    className="w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">Select bike</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>{vehicle.name} • {vehicle.model}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  <span>Service type</span>
                  <select
                    value={serviceForm.type}
                    onChange={(event) => setServiceForm((prev) => ({ ...prev, type: event.target.value, tasks: [] }))}
                    disabled={!serviceTypes.length}
                    className="w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="" disabled>Select service type</option>
                    {serviceTypes.map((type) => (
                      <option key={type.id} value={type.name}>{type.name}</option>
                    ))}
                    {!serviceTypes.length && <option value="" disabled>No service types available</option>}
                  </select>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="space-y-2 text-sm text-slate-300">
                  <span>Date</span>
                  <input
                    type="date"
                    value={serviceForm.date}
                    onChange={(event) => setServiceForm((prev) => ({ ...prev, date: event.target.value }))}
                    className="w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  <span>Amount</span>
                  <input
                    type="number"
                    min="0"
                    value={serviceForm.amount}
                    onChange={(event) => setServiceForm((prev) => ({ ...prev, amount: event.target.value }))}
                    placeholder="1200"
                    className="w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  <span>Showroom</span>
                  <div className="flex items-center gap-3 rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={serviceForm.showroom}
                      onChange={(event) => setServiceForm((prev) => ({ ...prev, showroom: event.target.checked }))}
                      className="h-4 w-4 accent-blue-500"
                    />
                    <span className="text-sm text-slate-200">Yes</span>
                  </div>
                </label>
              </div>

              <div className="rounded-3xl border border-slate-700 bg-slate-900 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Tasks for {serviceForm.type}</p>
                  <button
                    type="button"
                    onClick={() => openServiceTypeModal(serviceTypes.find((type) => type.name === serviceForm.type))}
                    disabled={!serviceForm.type}
                    className={`text-xs uppercase tracking-[0.2em] ${serviceForm.type ? 'text-blue-600 hover:text-blue-500' : 'text-slate-400 cursor-not-allowed'}`}
                  >
                    Edit type
                  </button>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {currentServiceTypeTasks.length ? (
                    currentServiceTypeTasks.map((task) => (
                      <label key={task} className="flex items-center gap-3 rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 transition hover:border-blue-500">
                        <input
                          type="checkbox"
                          checked={serviceForm.tasks.includes(task)}
                          onChange={(event) => {
                            const checked = event.target.checked;
                            setServiceForm((prev) => ({
                              ...prev,
                              tasks: checked ? [...prev.tasks, task] : prev.tasks.filter((item) => item !== task)
                            }));
                          }}
                          className="h-4 w-4 accent-blue-500"
                        />
                        <span>{task}</span>
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">
                      {serviceTypes.length
                        ? 'No tasks defined for this service type.'
                        : 'No service types available. Create one first to pick tasks.'}
                    </p>
                  )}
                </div>
              </div>

              <label className="space-y-2 text-sm text-slate-300">
                <span>Notes</span>
                <textarea
                  value={serviceForm.details}
                  onChange={(event) => setServiceForm((prev) => ({ ...prev, details: event.target.value }))}
                  rows="4"
                  placeholder="Add any maintenance notes"
                  className="w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </label>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="rounded-3xl border border-slate-700 bg-slate-900 px-6 py-3 text-sm font-bold text-slate-100 transition hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-3xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-500"
                >
                  {editingServiceId ? 'Save service' : 'Add service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isServiceTypeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 overflow-auto">
          <div className="w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-950 p-8 shadow-xl max-h-[calc(100vh-3rem)] overflow-y-auto">
            <div className="mb-6">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Service type</p>
              <h2 className="mt-2 text-3xl font-black text-white">{editingServiceTypeId ? 'Edit service type' : 'Add new service type'}</h2>
            </div>

            <div className="mb-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              <div className="rounded-3xl border border-slate-700 bg-slate-900 p-4 text-slate-300">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Existing service types</p>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">{serviceTypes.length}</span>
                </div>
                <div className="space-y-3">
                  {serviceTypes.length ? (
                    serviceTypes.map((type) => (
                      <div key={type.id} className="flex flex-col gap-3 rounded-3xl border border-slate-800 bg-slate-950 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold text-white">{type.name}</p>
                          <p className="text-sm text-slate-400">{type.tasks.length} task{type.tasks.length === 1 ? '' : 's'}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => openServiceTypeModal(type)}
                          className="rounded-3xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-blue-300 transition hover:bg-slate-800"
                        >
                          Edit
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950 p-5 text-center text-slate-400">
                      <p className="text-sm font-semibold text-slate-100">No service types yet</p>
                      <p className="mt-1 text-sm">Add a type to start using service templates.</p>
                    </div>
                  )}
                </div>
              </div>

              <form onSubmit={handleServiceTypeSubmit} className="space-y-5 rounded-3xl border border-slate-700 bg-slate-950 p-5">
                <label className="space-y-2 text-sm text-slate-300">
                  <span>Type name</span>
                  <input
                    value={serviceTypeForm.name}
                    onChange={(event) => setServiceTypeForm((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="General Service"
                    className="w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-300">
                  <span>Add task</span>
                  <div className="flex gap-2">
                    <input
                      value={serviceTypeForm.taskInput}
                      onChange={(event) => setServiceTypeForm((prev) => ({ ...prev, taskInput: event.target.value }))}
                      placeholder="Enter task and press Add"
                      className="w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const task = serviceTypeForm.taskInput.trim();
                        if (!task) return;
                        if (!serviceTypeForm.tasks.includes(task)) {
                          setServiceTypeForm((prev) => ({ ...prev, tasks: [...prev.tasks, task], taskInput: '' }));
                        }
                      }}
                      className="rounded-3xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-500"
                    >
                      Add
                    </button>
                  </div>
                </label>
                <div className="rounded-3xl border border-slate-700 bg-slate-900 p-4 text-sm text-slate-300">
                  <p className="font-semibold uppercase tracking-[0.2em] text-slate-400">Defined tasks</p>
                  <div className="mt-3 space-y-2">
                    {serviceTypeForm.tasks.length ? (
                      serviceTypeForm.tasks.map((task) => (
                        <div key={task} className="flex items-center justify-between rounded-3xl border border-slate-700 bg-slate-900 px-4 py-2">
                          <span>{task}</span>
                          <button
                            type="button"
                            onClick={() => setServiceTypeForm((prev) => ({ ...prev, tasks: prev.tasks.filter((item) => item !== task) }))}
                            className="text-xs uppercase tracking-[0.2em] text-red-600 hover:text-red-500"
                          >
                            Remove
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">No tasks defined yet.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsServiceTypeModalOpen(false)}
                  className="rounded-3xl border border-slate-700 bg-slate-900 px-6 py-3 text-sm font-bold text-slate-100 transition hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-3xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-500"
                >
                  {editingServiceTypeId ? 'Save type' : 'Add type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950 p-8 shadow-xl">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-900/50 text-red-400">
                <Trash2 size={28} />
              </div>
              <h2 className="text-2xl font-black text-white">Confirm deletion</h2>
              <p className="mt-3 text-slate-400">Are you sure you want to delete this {deleteType === 'vehicle' ? 'vehicle and its service records' : 'service record'}?</p>
            </div>
            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteTarget(null);
                  setDeleteType(null);
                }}
                className="flex-1 rounded-3xl border border-slate-700 bg-slate-900 px-6 py-3 text-sm font-bold text-slate-100 transition hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 rounded-3xl bg-red-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceCarePage;
