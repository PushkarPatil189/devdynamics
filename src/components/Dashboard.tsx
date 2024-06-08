import React, { useEffect, useState } from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt } from 'react-icons/fa';
import { useSpring, animated } from 'react-spring';
import './Dashboard.css';

interface ActivityData {
  date: Date;
  commits: number;
  pull_requests_opened: number;
  pull_requests_merged: number;
  meetings_attended: number;
  documentation_written: number;
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<ActivityData[]>([]);
  const [filteredData, setFilteredData] = useState<ActivityData[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get('${process.env.PUBLIC_URL}/data.json');
      const fetchedData = response.data.map((d: Omit<ActivityData, 'date'> & { date: string }) => ({
        ...d,
        date: new Date(d.date)
      }));
      setData(fetchedData);
      setFilteredData(fetchedData);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      const filtered = data.filter(d => {
        const date = new Date(d.date).getTime();
        return date >= new Date(startDate).getTime() && date <= new Date(endDate).getTime();
      });
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  }, [startDate, endDate, data]);

  const formattedData = filteredData.map(d => ({
    ...d,
    date: d.date.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' })
  }));

  const radarData = [
    { metric: 'Commits', value: filteredData.reduce((sum, d) => sum + d.commits, 0), fullMark: 100 },
    { metric: 'Pull requests opened', value: filteredData.reduce((sum, d) => sum + d.pull_requests_opened, 0), fullMark: 100 },
    { metric: 'Pull requests merged', value: filteredData.reduce((sum, d) => sum + d.pull_requests_merged, 0), fullMark: 100 },
    { metric: 'Meetings attended', value: filteredData.reduce((sum, d) => sum + d.meetings_attended, 0), fullMark: 100 },
    { metric: 'Documentation written', value: filteredData.reduce((sum, d) => sum + d.documentation_written, 0), fullMark: 100 },
  ];

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#387908'];

  const radarChartProps = useSpring({ opacity: 1, from: { opacity: 0 }, delay: 200 });
  const pieChartProps = useSpring({ opacity: 1, from: { opacity: 0 }, delay: 400 });

  return (
    <div className="dashboard">
      <h1>Developer Activity Dashboard</h1>

      <div className="date-picker">
        <DatePicker
          selected={startDate}
          onChange={(date: Date) => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          placeholderText="Start Date"
          dateFormat="yyyy-MM-dd"
          className="date-input"
        />
        <FaCalendarAlt size={20} className="calendar-icon" />
        <DatePicker
          selected={endDate}
          onChange={(date: Date) => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          placeholderText="End Date"
          dateFormat="yyyy-MM-dd"
          className="date-input"
        />
      </div>

      <div className="chart-container">
        <div className="chart-card line-chart">
          <h2>Activity Trends Over Time</h2>
          <LineChart width={800} height={400} data={formattedData}>
            <Line type="monotone" dataKey="commits" stroke="#8884d8" name="Commits" />
            <Line type="monotone" dataKey="pull_requests_opened" stroke="#82ca9d" name="PRs Opened" />
            <Line type="monotone" dataKey="pull_requests_merged" stroke="#ffc658" name="PRs Merged" />
            <Line type="monotone" dataKey="meetings_attended" stroke="#ff7300" name="Meetings" />
            <Line type="monotone" dataKey="documentation_written" stroke="#387908" name="Docs Written" />
            <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
          </LineChart>
        </div>

        <div className="radar-pie-container">
          <animated.div style={radarChartProps} className="chart-card radar-chart">
            <h2>Developer Metrics Radar Chart</h2>
            <RadarChart cx={330} cy={250} outerRadius={125} width={650} height={500} data={radarData}>
              <PolarGrid stroke="#555" strokeDasharray="5 5" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: 'black', fontWeight: 'bold' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#585858" />
              <Radar name="Metrics" dataKey="value" stroke="#8884d8" fill="#268501" fillOpacity={0.9} />
              <Tooltip />
            </RadarChart>
          </animated.div>

          <animated.div style={pieChartProps} className="chart-card pie-chart">
            <h2>Distribution of Activities</h2>
            <div className="pie-chart-container">
              <PieChart width={400} height={400}>
                <Pie
                  dataKey="value"
                  data={radarData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {radarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
              <div className="pie-chart-legend">
                {radarData.map((entry, index) => (
                  <div key={`legend-${index}`} className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <div className="legend-text">{entry.metric}: {entry.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </animated.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
