import React from "react";

interface ManualLockup {
  id: string;
  is_active: boolean;
  date: string;
  lockup_time: string;
  location: "court" | "labour" | "station";
  count: number;
  station: string;
  type: string;
  prisoner_category: string;
  sex: string;
}

interface LockupTableProps {
  lockups: ManualLockup[];
}

const categoryIds = {
  convict: "770e8400-e29b-41d4-a716-446655440001",
  remand: "770e8400-e29b-41d4-a716-446655440002",
  debtor: "770e8400-e29b-41d4-a716-446655440003",
  lodger: "770e8400-e29b-41d4-a716-446655440004",
};

const sexIds = {
  male: "880e8400-e29b-41d4-a716-446655440001",
  female: "880e8400-e29b-41d4-a716-446655440002",
};

interface LocationData {
  convict_male: number;
  convict_female: number;
  remand_male: number;
  remand_female: number;
  debtor_male: number;
  debtor_female: number;
  lodger_male: number;
  lodger_female: number;
}

export function LockupTable({ lockups }: LockupTableProps) {
  // Build data grid from lockups
  const buildDataGrid = () => {
    const grid: {
      station: LocationData;
      court: LocationData;
      labour: LocationData;
    } = {
      station: {
        convict_male: 0,
        convict_female: 0,
        remand_male: 0,
        remand_female: 0,
        debtor_male: 0,
        debtor_female: 0,
        lodger_male: 0,
        lodger_female: 0,
      },
      court: {
        convict_male: 0,
        convict_female: 0,
        remand_male: 0,
        remand_female: 0,
        debtor_male: 0,
        debtor_female: 0,
        lodger_male: 0,
        lodger_female: 0,
      },
      labour: {
        convict_male: 0,
        convict_female: 0,
        remand_male: 0,
        remand_female: 0,
        debtor_male: 0,
        debtor_female: 0,
        lodger_male: 0,
        lodger_female: 0,
      },
    };

    lockups.forEach((record) => {
      const location = record.location;
      let category = "";
      let sex = "";

      if (record.prisoner_category === categoryIds.convict)
        category = "convict";
      else if (record.prisoner_category === categoryIds.remand)
        category = "remand";
      else if (record.prisoner_category === categoryIds.debtor)
        category = "debtor";
      else if (record.prisoner_category === categoryIds.lodger)
        category = "lodger";

      if (record.sex === sexIds.male) sex = "male";
      else if (record.sex === sexIds.female) sex = "female";

      if (category && sex) {
        const fieldName =
          `${category}_${sex}` as keyof LocationData;
        grid[location][fieldName] += record.count;
      }
    });

    return grid;
  };

  // Calculate row totals
  const calculateRowTotal = (row: LocationData) => {
    return (
      row.convict_male +
      row.convict_female +
      row.remand_male +
      row.remand_female +
      row.debtor_male +
      row.debtor_female +
      row.lodger_male +
      row.lodger_female
    );
  };

  // Calculate column totals
  const calculateColumnTotals = (
    grid: ReturnType<typeof buildDataGrid>,
  ) => {
    return {
      convict_male:
        grid.station.convict_male +
        grid.court.convict_male +
        grid.labour.convict_male,
      convict_female:
        grid.station.convict_female +
        grid.court.convict_female +
        grid.labour.convict_female,
      remand_male:
        grid.station.remand_male +
        grid.court.remand_male +
        grid.labour.remand_male,
      remand_female:
        grid.station.remand_female +
        grid.court.remand_female +
        grid.labour.remand_female,
      debtor_male:
        grid.station.debtor_male +
        grid.court.debtor_male +
        grid.labour.debtor_male,
      debtor_female:
        grid.station.debtor_female +
        grid.court.debtor_female +
        grid.labour.debtor_female,
      lodger_male:
        grid.station.lodger_male +
        grid.court.lodger_male +
        grid.labour.lodger_male,
      lodger_female:
        grid.station.lodger_female +
        grid.court.lodger_female +
        grid.labour.lodger_female,
    };
  };

  const grid = buildDataGrid();
  const columnTotals = calculateColumnTotals(grid);
  const grandTotal = calculateRowTotal(columnTotals);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="border-r p-3 text-left min-w-[80px]">
              Location
            </th>
            <th
              className="border-r p-3 text-center"
              colSpan={2}
            >
              Convict
            </th>
            <th
              className="border-r p-3 text-center"
              colSpan={2}
            >
              Remand
            </th>
            <th
              className="border-r p-3 text-center"
              colSpan={2}
            >
              Debtor
            </th>
            <th
              className="border-r p-3 text-center"
              colSpan={2}
            >
              Lodger
            </th>
            <th className="p-3 text-center bg-primary/10">
              Total
            </th>
          </tr>
          <tr className="border-b bg-muted/30">
            <th className="border-r p-2"></th>
            <th className="border-r p-2 text-center text-sm">
              Male
            </th>
            <th className="border-r p-2 text-center text-sm">
              Female
            </th>
            <th className="border-r p-2 text-center text-sm">
              Male
            </th>
            <th className="border-r p-2 text-center text-sm">
              Female
            </th>
            <th className="border-r p-2 text-center text-sm">
              Male
            </th>
            <th className="border-r p-2 text-center text-sm">
              Female
            </th>
            <th className="border-r p-2 text-center text-sm">
              Male
            </th>
            <th className="border-r p-2 text-center text-sm">
              Female
            </th>
            <th className="p-2 text-center text-sm bg-primary/10"></th>
          </tr>
        </thead>
        <tbody>
          {/* Station Row */}
          <tr className="border-b">
            <td className="border-r p-3">Station</td>
            <td className="border-r p-2 text-center bg-gray-50">
              {grid.station.convict_male || 0}
            </td>
            <td className="border-r p-2 text-center bg-gray-50">
              {grid.station.convict_female || 0}
            </td>
            <td className="border-r p-2 text-center bg-gray-50">
              {grid.station.remand_male || 0}
            </td>
            <td className="border-r p-2 text-center bg-gray-50">
              {grid.station.remand_female || 0}
            </td>
            <td className="border-r p-2 text-center bg-gray-50">
              {grid.station.debtor_male || 0}
            </td>
            <td className="border-r p-2 text-center bg-gray-50">
              {grid.station.debtor_female || 0}
            </td>
            <td className="border-r p-2 text-center bg-gray-50">
              {grid.station.lodger_male || 0}
            </td>
            <td className="border-r p-2 text-center bg-gray-50">
              {grid.station.lodger_female || 0}
            </td>
            <td className="p-2 text-center bg-primary/10">
              {calculateRowTotal(grid.station)}
            </td>
          </tr>

          {/* Court Row */}
          <tr className="border-b">
            <td className="border-r p-3">Court</td>
            <td className="border-r p-2 text-center bg-gray-50">
              {grid.court.convict_male || 0}
            </td>
            <td className="border-r p-2 text-center bg-gray-50">
              {grid.court.convict_female || 0}
            </td>
            <td className="border-r p-2 text-center bg-gray-50">
              {grid.court.remand_male || 0}
            </td>
            <td className="border-r p-2 text-center bg-gray-50">
              {grid.court.remand_female || 0}
            </td>
            <td className="border-r p-2 text-center bg-gray-50">
              {grid.court.debtor_male || 0}
            </td>
            <td className="border-r p-2 text-center bg-gray-50">
              {grid.court.debtor_female || 0}
            </td>
            <td className="border-r p-2 text-center bg-gray-50">
              {grid.court.lodger_male || 0}
            </td>
            <td className="border-r p-2 text-center bg-gray-50">
              {grid.court.lodger_female || 0}
            </td>
            <td className="p-2 text-center bg-primary/10">
              {calculateRowTotal(grid.court)}
            </td>
          </tr>

          {/* Labour Row */}
          <tr className="border-b">
            <td className="border-r p-3">Labour</td>
            <td className="border-r p-2 text-center bg-gray-50">
              {grid.labour.convict_male || 0}
            </td>
            <td className="border-r p-2 text-center bg-gray-50">
              {grid.labour.convict_female || 0}
            </td>
            <td className="border-r p-2 text-center bg-gray-50">
              {grid.labour.remand_male || 0}
            </td>
            <td className="border-r p-2 text-center bg-gray-50">
              {grid.labour.remand_female || 0}
            </td>
            <td className="border-r p-2 text-center bg-gray-50">
              {grid.labour.debtor_male || 0}
            </td>
            <td className="border-r p-2 text-center bg-gray-50">
              {grid.labour.debtor_female || 0}
            </td>
            <td className="border-r p-2 text-center bg-gray-50">
              {grid.labour.lodger_male || 0}
            </td>
            <td className="border-r p-2 text-center bg-gray-50">
              {grid.labour.lodger_female || 0}
            </td>
            <td className="p-2 text-center bg-primary/10">
              {calculateRowTotal(grid.labour)}
            </td>
          </tr>

          {/* Total Row */}
          <tr className="bg-primary/10">
            <td className="border-r p-3">Total</td>
            <td className="border-r p-2 text-center">
              {columnTotals.convict_male}
            </td>
            <td className="border-r p-2 text-center">
              {columnTotals.convict_female}
            </td>
            <td className="border-r p-2 text-center">
              {columnTotals.remand_male}
            </td>
            <td className="border-r p-2 text-center">
              {columnTotals.remand_female}
            </td>
            <td className="border-r p-2 text-center">
              {columnTotals.debtor_male}
            </td>
            <td className="border-r p-2 text-center">
              {columnTotals.debtor_female}
            </td>
            <td className="border-r p-2 text-center">
              {columnTotals.lodger_male}
            </td>
            <td className="border-r p-2 text-center">
              {columnTotals.lodger_female}
            </td>
            <td className="p-2 text-center">{grandTotal}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
