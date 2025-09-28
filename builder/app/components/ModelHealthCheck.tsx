import { useEffect, useState } from 'react';
import type { ModelInfo } from '../utils/types';

interface ModelHealthStatus {
  name: string;
  label: string;
  status: 'available' | 'error' | 'checking';
  error?: string;
  lastChecked?: Date;
}

interface ModelHealthCheckProps {
  models: ModelInfo[];
  onHealthUpdate?: (statuses: ModelHealthStatus[]) => void;
  checkInterval?: number; // in milliseconds
}

export function ModelHealthCheck({
  models,
  onHealthUpdate,
  checkInterval = 300000 // 5 minutes default
}: ModelHealthCheckProps) {
  const [healthStatuses, setHealthStatuses] = useState<ModelHealthStatus[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const checkModelHealth = async (model: ModelInfo): Promise<ModelHealthStatus> => {
    const startTime = new Date();

    try {
      // Use the API health check endpoint
      const response = await fetch('/api/chat', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json() as { models?: Array<{ name: string; status: string; error?: string }> };
        const modelStatus = data.models?.find((m) => m.name === model.name);

        return {
          name: model.name,
          label: model.label,
          status: modelStatus?.status === 'available' ? 'available' : 'error',
          error: modelStatus?.error,
          lastChecked: startTime
        };
      } else {
        return {
          name: model.name,
          label: model.label,
          status: 'error',
          error: `HTTP ${response.status}: ${response.statusText}`,
          lastChecked: startTime
        };
      }
    } catch (error) {
      return {
        name: model.name,
        label: model.label,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        lastChecked: startTime
      };
    }
  };

  const checkAllModels = async () => {
    setIsChecking(true);

    try {
      const results = await Promise.allSettled(
        models.map(model => checkModelHealth(model))
      );

      const statuses: ModelHealthStatus[] = results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          const model = models[index];
          return {
            name: model.name,
            label: model.label,
            status: 'error' as const,
            error: result.reason?.message || 'Check failed',
            lastChecked: new Date()
          };
        }
      });

      setHealthStatuses(statuses);
      onHealthUpdate?.(statuses);
    } catch (error) {
      console.error('Error checking model health:', error);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Initial check
    checkAllModels();

    // Set up periodic checks
    if (checkInterval > 0) {
      const interval = setInterval(checkAllModels, checkInterval);
      return () => clearInterval(interval);
    }
  }, [models, checkInterval]);

  const getStatusIcon = (status: ModelHealthStatus['status']) => {
    switch (status) {
      case 'available':
        return <div className="i-ph:check-circle-bold text-green-500 text-sm"></div>;
      case 'error':
        return <div className="i-ph:x-circle-bold text-red-500 text-sm"></div>;
      case 'checking':
        return <div className="i-svg-spinners:3-dots-fade text-gray-400 text-sm"></div>;
    }
  };

  const getStatusColor = (status: ModelHealthStatus['status']) => {
    switch (status) {
      case 'available':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'checking':
        return 'text-gray-400';
    }
  };

  return (
    <div className="bg-thor-bg-secondary rounded-lg p-4 border border-thor-elements-borderColor">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-thor-elements-textPrimary">
          Model Status
        </h3>
        <button
          onClick={checkAllModels}
          disabled={isChecking}
          className="text-xs bg-thor-elements-button-secondary text-thor-elements-button-secondary-text px-2 py-1 rounded hover:bg-thor-elements-button-secondary-hover disabled:opacity-50"
        >
          {isChecking ? 'Checking...' : 'Refresh'}
        </button>
      </div>

      <div className="space-y-2">
        {healthStatuses.map((status) => (
          <div key={status.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {getStatusIcon(status.status)}
              <span className="text-thor-elements-textPrimary">{status.label}</span>
            </div>
            <span className={`text-xs ${getStatusColor(status.status)}`}>
              {status.status === 'available' ? 'Online' :
               status.status === 'error' ? 'Offline' : 'Checking...'}
            </span>
          </div>
        ))}
      </div>

      {healthStatuses.length === 0 && (
        <div className="text-center text-thor-elements-textSecondary text-sm py-4">
          Checking model status...
        </div>
      )}
    </div>
  );
}