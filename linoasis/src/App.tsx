/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { 
  ChevronDown, 
  Github, 
  Cpu, 
  Layers, 
  Zap, 
  ArrowRight, 
  Maximize2, 
  Activity,
  Box,
  Brain,
  Maximize,
  RefreshCw,
  Settings2,
  Play
} from 'lucide-react';
import * as d3 from 'd3';
import * as math from 'mathjs';
import { cn } from './lib/utils';

// --- Components ---

const VectorField = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    svg.selectAll("*").remove();
    
    const cols = 20;
    const rows = 12;
    const spacing = Math.max(width / cols, height / rows);
    
    const points = [];
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        points.push({
          x: i * spacing + spacing / 2,
          y: j * spacing + spacing / 2,
          angle: 0
        });
      }
    }

    const lines = svg.selectAll("line")
      .data(points)
      .enter()
      .append("line")
      .attr("x1", d => d.x)
      .attr("y1", d => d.y)
      .attr("x2", d => d.x + 15)
      .attr("y2", d => d.y)
      .attr("stroke", "rgba(242, 125, 38, 0.15)")
      .attr("stroke-width", 1)
      .attr("stroke-linecap", "round");

    const animate = (t: number) => {
      lines.attr("x2", d => {
        const angle = Math.sin(d.x * 0.005 + t * 0.0005) * Math.cos(d.y * 0.005 + t * 0.0005) * Math.PI * 4;
        return d.x + Math.cos(angle) * 25;
      })
      .attr("y2", d => {
        const angle = Math.sin(d.x * 0.005 + t * 0.0005) * Math.cos(d.y * 0.005 + t * 0.0005) * Math.PI * 4;
        return d.y + Math.sin(angle) * 25;
      })
      .attr("stroke", (d, i) => {
        const dist = Math.sqrt(Math.pow(d.x - width/2, 2) + Math.pow(d.y - height/2, 2));
        const opacity = Math.max(0.05, 0.4 - dist / width);
        const color = i % 2 === 0 ? "242, 125, 38" : "38, 242, 213";
        return `rgba(${color}, ${opacity})`;
      })
      .attr("stroke-width", d => Math.sin(d.x * 0.01 + t * 0.001) + 1.5);
      
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, []);

  return (
    <svg 
      ref={svgRef} 
      className="fixed inset-0 w-full h-full -z-10 pointer-events-none opacity-40"
    />
  );
};

const SectionHeader = ({ title, subtitle, number }: { title: string, subtitle: string, number: string }) => (
  <div className="mb-16">
    <div className="flex items-center gap-4 mb-4">
      <span className="font-mono text-oasis-accent text-sm tracking-widest">{number}</span>
      <div className="h-[1px] w-12 bg-oasis-accent/30" />
    </div>
    <h2 className="text-5xl md:text-7xl font-serif italic mb-4">{title}</h2>
    <p className="text-oasis-ink/60 max-w-xl text-lg leading-relaxed">{subtitle}</p>
  </div>
);

const FeatureCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="glass p-8 rounded-2xl group cursor-pointer"
  >
    <div className="w-12 h-12 rounded-xl bg-oasis-accent/10 flex items-center justify-center mb-6 group-hover:bg-oasis-accent/20 transition-colors">
      <Icon className="text-oasis-accent w-6 h-6" />
    </div>
    <h3 className="text-xl font-semibold mb-3">{title}</h3>
    <p className="text-oasis-ink/50 leading-relaxed">{description}</p>
  </motion.div>
);

const MatrixPlayground = ({ initialMatrix }: { initialMatrix?: number[][] }) => {
  const [matrix, setMatrix] = useState(initialMatrix || [[1, 0], [0, 1]]);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (initialMatrix) {
      setMatrix(initialMatrix);
    }
  }, [initialMatrix]);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const width = 400;
    const height = 400;
    const margin = 40;
    
    svg.selectAll("*").remove();
    
    const xScale = d3.scaleLinear().domain([-2, 2]).range([margin, width - margin]);
    const yScale = d3.scaleLinear().domain([-2, 2]).range([height - margin, margin]);

    // Grid
    const gridData = [];
    for (let i = -2; i <= 2; i += 0.5) {
      gridData.push({ x1: i, y1: -2, x2: i, y2: 2 });
      gridData.push({ x1: -2, y1: i, x2: 2, y2: i });
    }

    // Draw transformed grid
    const drawGrid = (m: number[][], color: string, opacity: number) => {
      gridData.forEach(line => {
        const p1 = [line.x1 * m[0][0] + line.y1 * m[0][1], line.x1 * m[1][0] + line.y1 * m[1][1]];
        const p2 = [line.x2 * m[0][0] + line.y2 * m[0][1], line.x2 * m[1][0] + line.y2 * m[1][1]];
        
        svg.append("line")
          .attr("x1", xScale(p1[0]))
          .attr("y1", yScale(p1[1]))
          .attr("x2", xScale(p2[0]))
          .attr("y2", yScale(p2[1]))
          .attr("stroke", color)
          .attr("stroke-width", 1)
          .attr("stroke-opacity", opacity);
      });
    };

    drawGrid([[1, 0], [0, 1]], "rgba(255,255,255,0.1)", 0.5); // Original
    drawGrid(matrix, "var(--color-oasis-accent)", 0.6); // Transformed

    // Determinant Area (Parallelogram)
    const p0 = [0, 0];
    const p1 = [matrix[0][0], matrix[1][0]];
    const p2 = [matrix[0][0] + matrix[0][1], matrix[1][0] + matrix[1][1]];
    const p3 = [matrix[0][1], matrix[1][1]];

    svg.append("polygon")
      .attr("points", `${xScale(p0[0])},${yScale(p0[1])} ${xScale(p1[0])},${yScale(p1[1])} ${xScale(p2[0])},${yScale(p2[1])} ${xScale(p3[0])},${yScale(p3[1])}`)
      .attr("fill", "var(--color-oasis-accent)")
      .attr("fill-opacity", 0.15)
      .attr("stroke", "var(--color-oasis-accent)")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4 4");

    // Basis vectors
    const drawVector = (v: number[], color: string, label: string) => {
      const end = [v[0] * matrix[0][0] + v[1] * matrix[0][1], v[0] * matrix[1][0] + v[1] * matrix[1][1]];
      
      svg.append("line")
        .attr("x1", xScale(0))
        .attr("y1", yScale(0))
        .attr("x2", xScale(end[0]))
        .attr("y2", yScale(end[1]))
        .attr("stroke", color)
        .attr("stroke-width", 3)
        .attr("marker-end", "url(#arrowhead)");

      svg.append("text")
        .attr("x", xScale(end[0]) + 5)
        .attr("y", yScale(end[1]) - 5)
        .attr("fill", color)
        .attr("font-family", "monospace")
        .attr("font-size", "12px")
        .text(label);
    };

    // Arrowhead marker
    svg.append("defs").append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 8)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "currentColor");

    drawVector([1, 0], "var(--color-oasis-accent)", "î");
    drawVector([0, 1], "var(--color-oasis-teal)", "ĵ");

  }, [matrix]);

  return (
    <div className="flex flex-col md:flex-row gap-12 items-center mt-24 glass p-12 rounded-3xl">
      <div className="flex-1 space-y-8">
        <h3 className="text-3xl font-serif italic">The Matrix Playground</h3>
        <p className="text-oasis-ink/50">
          Adjust the basis vectors to see how the entire space transforms. 
          Notice how the grid lines remain parallel and evenly spaced—the hallmark of a <span className="text-oasis-accent">linear</span> transformation.
        </p>
        
        <div className="grid grid-cols-2 gap-4 max-w-xs">
          {matrix.map((row, i) => row.map((val, j) => (
            <div key={`${i}-${j}`} className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest opacity-40">m{i+1}{j+1}</label>
              <input 
                type="range" 
                min="-2" 
                max="2" 
                step="0.1" 
                value={val} 
                onChange={(e) => {
                  const newMatrix = [...matrix];
                  newMatrix[i][j] = parseFloat(e.target.value);
                  setMatrix(newMatrix);
                }}
                className="w-full accent-oasis-accent"
              />
            </div>
          )))}
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { name: 'Identity', m: [[1, 0], [0, 1]] },
            { name: 'Rotation', m: [[0.7, -0.7], [0.7, 0.7]] },
            { name: 'Shear', m: [[1, 1], [0, 1]] },
            { name: 'Projection', m: [[1, 0], [0, 0]] },
            { name: 'Scale', m: [[1.5, 0], [0, 0.5]] },
          ].map((preset) => (
            <button
              key={preset.name}
              onClick={() => setMatrix(preset.m)}
              className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] uppercase tracking-widest hover:bg-oasis-accent/20 hover:border-oasis-accent/40 transition-all"
            >
              {preset.name}
            </button>
          ))}
          <button
            onClick={() => setMatrix([[1, 0], [0, 1]])}
            className="px-3 py-1 bg-oasis-accent/10 border border-oasis-accent/20 rounded-full text-[10px] uppercase tracking-widest text-oasis-accent hover:bg-oasis-accent/20 transition-all"
          >
            Reset
          </button>
        </div>

        <div className="font-mono text-xl p-6 bg-white/5 rounded-xl inline-block">
          <span className="text-oasis-ink/30 mr-4">[</span>
          <div className="inline-grid grid-cols-2 gap-x-8 gap-y-2 align-middle">
            {matrix.flat().map((v, i) => (
              <span key={i} className={cn(i % 2 === 0 ? "text-oasis-accent" : "text-oasis-teal")}>
                {v.toFixed(1)}
              </span>
            ))}
          </div>
          <span className="text-oasis-ink/30 ml-4">]</span>
        </div>
      </div>

      <div className="relative">
        <svg ref={svgRef} width="400" height="400" className="bg-black/20 rounded-2xl border border-white/5" />
        <div className="absolute top-4 right-4 font-mono text-[10px] uppercase tracking-widest opacity-40">
          Det: {(matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]).toFixed(2)}
        </div>
      </div>
    </div>
  );
};

const MatrixWorld = ({ onTestMatrix }: { onTestMatrix: (m: number[][]) => void }) => {
  const [activeType, setActiveType] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const generateRandomOfType = (type: string) => {
    let m = [[1, 0], [0, 1]];
    switch (type) {
      case 'symmetric':
        const a = Math.floor(Math.random() * 5) - 2;
        const b = Math.floor(Math.random() * 5) - 2;
        const c = Math.floor(Math.random() * 5) - 2;
        m = [[a, b], [b, c]];
        break;
      case 'orthogonal':
        const theta = Math.random() * Math.PI * 2;
        m = [[Math.cos(theta), -Math.sin(theta)], [Math.sin(theta), Math.cos(theta)]];
        break;
      case 'projection':
        const u = [Math.random(), Math.random()];
        const mag = Math.sqrt(u[0]**2 + u[1]**2);
        const u_unit = [u[0]/mag, u[1]/mag];
        m = [[u_unit[0]**2, u_unit[0]*u_unit[1]], [u_unit[0]*u_unit[1], u_unit[1]**2]];
        break;
      case 'positive':
        const v1 = [Math.random() * 2, Math.random() * 2];
        const v2 = [Math.random() * 2, Math.random() * 2];
        m = [[v1[0]**2 + v2[0]**2, v1[0]*v1[1] + v2[0]*v2[1]], [v1[0]*v1[1] + v2[0]*v2[1], v1[1]**2 + v2[1]**2]];
        break;
      default:
        m = [[Math.floor(Math.random() * 5) - 2, Math.floor(Math.random() * 5) - 2], [Math.floor(Math.random() * 5) - 2, Math.floor(Math.random() * 5) - 2]];
    }
    onTestMatrix(m);
    // Scroll to playground
    document.getElementById('intuition')?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setScale(prev => Math.max(0.5, Math.min(3, prev + delta)));
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  const matrixData = {
    matrices: {
      title: "Matrices (m × n)",
      formula: "A = UΣVᵀ (SVD)",
      desc: "The universal set. Every matrix has a Singular Value Decomposition.",
      properties: ["Row Rank = Column Rank", "Orthonormal basis U, V", "A = CR (Column-Row)"],
      example: "A = [1 2 3; 4 5 6]"
    },
    square: {
      title: "Square Matrices (n × n)",
      formula: "PA = LU",
      desc: "Equal dimensions. The birthplace of determinants and eigenvalues.",
      properties: ["Invertible (det ≠ 0, all λ ≠ 0)", "Singular (det = 0, at least one λ = 0)", "A = QR (Gram-Schmidt)", "Triangularize"],
      example: "A = [2 1; 0 2]"
    },
    diagonalizable: {
      title: "Diagonalizable",
      formula: "A = XΛX⁻¹",
      desc: "Matrices that can be simplified into a diagonal form through a change of basis.",
      properties: ["n independent eigenvectors", "A = XJX⁻¹ (Jordan form if not diagonalizable)", "Diagonalize"],
      example: "A = [1 1; 0 2]"
    },
    normal: {
      title: "Normal",
      formula: "AᵀA = AAᵀ",
      desc: "Matrices that commute with their transpose. They have a complete set of orthonormal eigenvectors.",
      properties: ["A = QΛQᵀ (Complex Q)", "Includes Symmetric, Skew-Symmetric, Orthogonal"],
      example: "A = [0 1; 0 1]"
    },
    symmetric: {
      title: "Symmetric",
      formula: "S = Sᵀ",
      desc: "Mirror images across the diagonal. Essential in physics and optimization.",
      properties: ["Real eigenvalues", "Orthogonal eigenvectors", "S = QΛQᵀ (Real Q)", "all λ are real"],
      example: "S = [1 2; 2 0]"
    },
    psd: {
      title: "Positive Semidefinite",
      formula: "xᵀAx ≥ 0",
      desc: "Matrices where the 'energy' is never negative. Found in covariance and kernels.",
      properties: ["all λ ≥ 0", "all AᵀA are PSD"],
      example: "AᵀA"
    },
    projection: {
      title: "Projection",
      formula: "P² = P = Pᵀ",
      desc: "Transformations that project vectors onto a subspace.",
      properties: ["λ = 1 or 0", "P projects onto its Column Space"],
      example: "P = [1 0; 0 0]"
    },
    orthogonal: {
      title: "Orthogonal",
      formula: "Q⁻¹ = Qᵀ",
      desc: "Pure rotations and reflections. Length and angle preserving.",
      properties: ["all |λ| = 1", "Columns are orthonormal", "QᵀQ = I"],
      example: "Q = [0 1; -1 0]"
    },
    positive: {
      title: "Positive Definite",
      formula: "xᵀAx > 0",
      desc: "The 'positive numbers' of matrices. Curvature is always upward.",
      properties: ["all λ > 0", "Invertible Symmetric matrices with λ > 0"],
      example: "A = [2 1; 1 2]"
    }
  };

  return (
    <div className="py-32 px-8 max-w-7xl mx-auto">
      <SectionHeader 
        number="03"
        title="Matrix World"
        subtitle="A hierarchical map of the matrix universe. From the chaos of general rectangular arrays to the perfect symmetry of positive definite forms."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        <div 
          ref={containerRef}
          className="lg:col-span-2 relative aspect-[4/3] glass rounded-3xl p-8 overflow-hidden flex items-center justify-center cursor-zoom-in"
        >
          <motion.svg 
            viewBox="0 0 800 600" 
            className="w-full h-full origin-center"
            animate={{ scale }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Nested Ellipses - Matrix World Map */}
            <g className="cursor-pointer">
              {/* Matrices m x n */}
              <motion.ellipse 
                cx="400" cy="300" rx="380" ry="280" 
                fill="none" stroke="currentColor" strokeWidth="1" 
                initial={{ opacity: 0.3 }}
                whileHover={{ opacity: 1, strokeWidth: 2, scale: 1.01 }}
                className={cn("text-white/5 transition-colors", activeType === 'matrices' && "text-oasis-accent opacity-100")}
                onMouseEnter={() => setActiveType('matrices')}
              />
              
              {/* Square Matrices */}
              <motion.ellipse 
                cx="410" cy="300" rx="330" ry="250" 
                fill="none" stroke="currentColor" strokeWidth="1" 
                initial={{ opacity: 0.4 }}
                whileHover={{ opacity: 1, strokeWidth: 2, scale: 1.01 }}
                className={cn("text-white/10 transition-colors", activeType === 'square' && "text-oasis-accent opacity-100")}
                onMouseEnter={() => setActiveType('square')}
              />

              {/* Diagonalizable */}
              <motion.ellipse 
                cx="420" cy="300" rx="280" ry="210" 
                fill="none" stroke="currentColor" strokeWidth="1" 
                initial={{ opacity: 0.5 }}
                whileHover={{ opacity: 1, strokeWidth: 2, scale: 1.01 }}
                className={cn("text-white/15 transition-colors", activeType === 'diagonalizable' && "text-oasis-accent opacity-100")}
                onMouseEnter={() => setActiveType('diagonalizable')}
              />

              {/* Normal */}
              <motion.ellipse 
                cx="430" cy="310" rx="230" ry="170" 
                fill="none" stroke="currentColor" strokeWidth="1" 
                initial={{ opacity: 0.6 }}
                whileHover={{ opacity: 1, strokeWidth: 2, scale: 1.02 }}
                className={cn("text-white/20 transition-colors", activeType === 'normal' && "text-oasis-teal opacity-100")}
                onMouseEnter={() => setActiveType('normal')}
              />

              {/* Symmetric */}
              <motion.ellipse 
                cx="450" cy="320" rx="180" ry="140" 
                fill="none" stroke="currentColor" strokeWidth="2" 
                initial={{ opacity: 0.7 }}
                whileHover={{ opacity: 1, strokeWidth: 3, scale: 1.03 }}
                className={cn("text-white/30 transition-colors", activeType === 'symmetric' && "text-oasis-accent opacity-100")}
                onMouseEnter={() => setActiveType('symmetric')}
              />

              {/* Positive Semidefinite */}
              <motion.ellipse 
                cx="470" cy="330" rx="130" ry="100" 
                fill="none" stroke="currentColor" strokeWidth="1" 
                initial={{ opacity: 0.8 }}
                whileHover={{ opacity: 1, strokeWidth: 2, scale: 1.04 }}
                className={cn("text-white/40 transition-colors", activeType === 'psd' && "text-oasis-accent opacity-100")}
                onMouseEnter={() => setActiveType('psd')}
              />

              {/* Projection (Inner) */}
              <motion.ellipse 
                cx="480" cy="340" rx="90" ry="70" 
                fill="none" stroke="currentColor" strokeWidth="1" 
                initial={{ opacity: 0.9 }}
                whileHover={{ opacity: 1, strokeWidth: 2, scale: 1.05 }}
                className={cn("text-white/50 transition-colors", activeType === 'projection' && "text-oasis-teal opacity-100")}
                onMouseEnter={() => setActiveType('projection')}
              />

              {/* Positive Definite (Smallest) */}
              <motion.ellipse 
                cx="490" cy="350" rx="50" ry="40" 
                fill="none" stroke="currentColor" strokeWidth="1" 
                initial={{ opacity: 1 }}
                whileHover={{ strokeWidth: 3, scale: 1.1, filter: "drop-shadow(0 0 8px #F27D26)" }}
                className={cn("text-white/60 transition-colors", activeType === 'positive' && "text-oasis-accent")}
                onMouseEnter={() => setActiveType('positive')}
              />

              {/* Orthogonal (Intersecting) */}
              <motion.ellipse 
                cx="280" cy="380" rx="120" ry="90" 
                fill="none" stroke="currentColor" strokeWidth="1" 
                initial={{ opacity: 0.4 }}
                whileHover={{ opacity: 1, strokeWidth: 2, scale: 1.05 }}
                className={cn("text-white/20 transition-colors", activeType === 'orthogonal' && "text-oasis-teal opacity-100")}
                onMouseEnter={() => setActiveType('orthogonal')}
              />

              {/* Diagonal Area */}
              <motion.rect 
                x="440" y="340" width="100" height="40" rx="20"
                fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2"
                className="text-oasis-teal/40"
              />
              <text x="490" y="365" textAnchor="middle" className="fill-oasis-teal/60 font-mono text-[8px]">Diagonal Λ Σ</text>

              {/* Identity and Zero */}
              <circle cx="460" cy="355" r="3" className="fill-oasis-accent" />
              <text x="460" y="350" textAnchor="middle" className="fill-oasis-accent font-bold text-[10px]">I</text>
              <circle cx="520" cy="355" r="3" className="fill-white/40" />
              <text x="520" y="350" textAnchor="middle" className="fill-white/40 font-bold text-[10px]">O</text>

              {/* Jordan (Special Case) */}
              <motion.g 
                whileHover={{ scale: 1.1 }}
                className="cursor-help"
                onMouseEnter={() => setActiveType('diagonalizable')}
              >
                <circle cx="720" cy="480" r="45" fill="none" stroke="currentColor" strokeWidth="1" className="text-white/10" />
                <text x="720" y="475" textAnchor="middle" className="fill-white/60 font-mono text-[10px]">Jordan</text>
                <text x="720" y="495" textAnchor="middle" className="fill-white/30 font-mono text-[7px]">J = [λ₁ 1; 0 λ₁]</text>
              </motion.g>
            </g>

            {/* Labels */}
            <text x="400" y="45" textAnchor="middle" className="fill-white/10 font-serif italic text-[10px]">Matrices (m × n)</text>
            <text x="410" y="80" textAnchor="middle" className="fill-white/20 font-serif italic text-[10px]">Square (n × n)</text>
            
            {/* Split within Square */}
            <line x1="410" y1="100" x2="410" y2="250" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" className="text-white/10" />
            
            {/* Arrows between Invertible and Singular */}
            <path d="M380,110 L440,110" fill="none" stroke="currentColor" strokeWidth="0.5" markerStart="url(#arrowhead-small)" markerEnd="url(#arrowhead-small)" className="text-white/20" />
            
            <text x="350" y="110" textAnchor="middle" className="fill-white/20 font-mono text-[8px] uppercase tracking-tighter">Invertible</text>
            <text x="470" y="110" textAnchor="middle" className="fill-white/20 font-mono text-[8px] uppercase tracking-tighter">Singular</text>
            <text x="350" y="125" textAnchor="middle" className="fill-white/10 font-mono text-[6px]">det(A) ≠ 0, all λ ≠ 0</text>
            <text x="470" y="125" textAnchor="middle" className="fill-white/10 font-mono text-[6px]">det(A) = 0, at least one λ = 0</text>

            <text x="420" y="120" textAnchor="middle" className="fill-white/30 font-serif italic text-[10px]">Diagonalizable</text>
            <text x="430" y="165" textAnchor="middle" className="fill-white/40 font-serif italic text-[10px]">Normal</text>
            <text x="450" y="210" textAnchor="middle" className="fill-white/50 font-serif italic text-[10px]">Symmetric</text>
            <text x="280" y="385" textAnchor="middle" className="fill-white/30 font-serif italic text-[10px]">Orthogonal</text>

            {/* Specific Decompositions and Labels */}
            <text x="350" y="60" textAnchor="middle" className="fill-white/10 font-mono text-[7px]">A = CR (row rank = col rank)</text>
            <text x="200" y="100" className="fill-white/10 font-mono text-[8px]">A = QR (Gram-Schmidt)</text>
            <text x="600" y="100" className="fill-white/10 font-mono text-[8px]">PA = LU (Triangularize)</text>
            <text x="600" y="115" className="fill-white/5 font-mono text-[6px]">U has a zero row</text>
            
            {/* Pseudoinverse Arrows */}
            <path d="M350,550 L450,550" fill="none" stroke="currentColor" strokeWidth="0.5" markerStart="url(#arrowhead-small)" markerEnd="url(#arrowhead-small)" className="text-white/20" />
            <text x="320" y="550" textAnchor="end" className="fill-white/10 font-mono text-[8px]">A⁻¹ = VΣ⁻¹Uᵀ</text>
            <text x="480" y="550" textAnchor="start" className="fill-white/10 font-mono text-[8px]">A⁺ = VΣ⁺Uᵀ</text>
            <text x="400" y="565" textAnchor="middle" className="fill-white/5 font-mono text-[6px]">pseudoinverse for all A</text>

            {/* Matrix Examples from Diagram */}
            <g className="fill-white/10 font-mono text-[7px]">
              <text x="120" y="150">A = [1 2 3; 4 5 6]</text>
              <text x="220" y="230">A = [2 1; 0 2]</text>
              <text x="250" y="300">A = [1 1; 0 2]</text>
              <text x="550" y="300">A = [0 1; 0 1]</text>
              <text x="650" y="350">A = [0 2; 0 0]</text>
              <text x="550" y="450">S = [1 2; 2 0]</text>
              <text x="250" y="450">Q = [0 1; -1 0]</text>
            </g>

            {/* Arrowhead markers */}
            <defs>
              <marker id="arrowhead-small" viewBox="0 -5 10 10" refX="8" refY="0" markerWidth="4" markerHeight="4" orient="auto">
                <path d="M0,-5L10,0L0,5" fill="currentColor" />
              </marker>
            </defs>

            {/* Credits */}
            <text x="20" y="580" className="fill-white/10 font-mono text-[6px]">
              (v1.3) Drawn by Kenji Hiranabe with the help of Prof. Gilbert Strang
            </text>
          </motion.svg>

          {/* Zoom Indicator */}
          <div className="absolute bottom-6 left-6 flex items-center gap-3 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 pointer-events-none">
            <Maximize size={12} className="text-oasis-accent" />
            <span className="font-mono text-[10px] text-white/60 uppercase tracking-widest">
              Zoom: {Math.round(scale * 100)}%
            </span>
            <span className="text-[8px] text-white/20 ml-2">Ctrl + Scroll</span>
          </div>

          {/* Floating Matrix Examples */}
          <div className="absolute top-12 left-12 font-mono text-[10px] text-white/20">
            A = [ 1 2 3 ]<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;[ 4 5 6 ]
          </div>
          <div className="absolute bottom-12 right-12 font-mono text-[10px] text-white/20">
            A⁻¹ = VΣ⁻¹Uᵀ
          </div>
        </div>

        {/* Info Panel */}
        <div className="space-y-8">
          <AnimatePresence mode="wait">
            {activeType ? (
              <motion.div 
                key={activeType}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass p-8 rounded-3xl border-oasis-accent/30"
              >
                <span className="font-mono text-oasis-accent text-xs tracking-widest uppercase mb-4 block">Classification</span>
                <h3 className="text-3xl font-serif italic mb-2">{(matrixData as any)[activeType].title}</h3>
                <code className="text-oasis-teal block mb-6 font-mono">{(matrixData as any)[activeType].formula}</code>
                <p className="text-oasis-ink/60 mb-8 leading-relaxed">
                  {(matrixData as any)[activeType].desc}
                </p>
                <div className="space-y-3 mb-8">
                  {(matrixData as any)[activeType].properties.map((prop: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-oasis-ink/80">
                      <div className="w-1.5 h-1.5 rounded-full bg-oasis-accent" />
                      {prop}
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                  <span className="text-[10px] uppercase tracking-widest text-white/20 block mb-2">Example</span>
                  <code className="text-oasis-accent font-mono text-sm">{(matrixData as any)[activeType].example}</code>
                </div>
                
                <button 
                  onClick={() => generateRandomOfType(activeType)}
                  className="w-full mt-6 py-4 bg-oasis-accent text-oasis-bg font-mono text-xs uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                >
                  <Play size={14} fill="currentColor" /> Test in Playground
                </button>
              </motion.div>
            ) : (
              <div className="glass p-8 rounded-3xl border-white/5 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
                <Box className="text-white/10 mb-4" size={48} />
                <p className="text-white/30 font-mono text-xs uppercase tracking-widest">Hover over the map to explore</p>
              </div>
            )}
          </AnimatePresence>

          <div className="p-6 rounded-2xl bg-oasis-accent/5 border border-oasis-accent/10">
            <p className="text-xs text-oasis-ink/40 leading-relaxed italic">
              "The Singular Value Decomposition (SVD) is the final word in linear algebra. It works for every matrix, rectangular or square."
              <span className="block mt-2 font-mono uppercase tracking-tighter">— Gilbert Strang</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- ML Components ---

const NeuralNetworkViz = () => {
  return (
    <div className="relative h-64 w-full glass rounded-2xl overflow-hidden p-8 flex items-center justify-between">
      {[4, 6, 4].map((nodes, layerIndex) => (
        <div key={layerIndex} className="flex flex-col justify-around h-full z-10">
          {Array.from({ length: nodes }).map((_, nodeIndex) => (
            <motion.div
              key={nodeIndex}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: layerIndex * 0.2 + nodeIndex * 0.05 }}
              className="w-3 h-3 rounded-full bg-oasis-teal shadow-[0_0_10px_rgba(38,242,213,0.5)]"
            />
          ))}
        </div>
      ))}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
        <defs>
          <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-oasis-teal)" />
            <stop offset="100%" stopColor="var(--color-oasis-accent)" />
          </linearGradient>
        </defs>
        {/* Simple mock connections */}
        <path d="M50,40 L150,20 M50,40 L150,60 M50,40 L150,100" stroke="url(#line-grad)" strokeWidth="1" fill="none" />
        <path d="M50,100 L150,20 M50,100 L150,140" stroke="url(#line-grad)" strokeWidth="1" fill="none" />
        <path d="M50,160 L150,100 M50,160 L150,200" stroke="url(#line-grad)" strokeWidth="1" fill="none" />
      </svg>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-oasis-teal/5 to-transparent animate-pulse pointer-events-none" />
    </div>
  );
};

const PCAViz = () => {
  return (
    <div className="relative h-64 w-full glass rounded-2xl overflow-hidden p-8 flex items-center justify-center">
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Principal Component Line */}
        <motion.line
          x1="20" y1="180" x2="180" y2="20"
          stroke="var(--color-oasis-accent)"
          strokeWidth="2"
          strokeDasharray="4 4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        {/* Data Points */}
        {Array.from({ length: 20 }).map((_, i) => {
          const x = 40 + Math.random() * 120;
          const y = 40 + Math.random() * 120;
          return (
            <motion.circle
              key={i}
              cx={x}
              cy={y}
              r="2"
              fill="white"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.5], x: [x, (x + (200-y))/2], y: [y, (y + (200-x))/2] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.1 }}
            />
          );
        })}
      </svg>
      <div className="absolute bottom-4 left-4 text-[10px] uppercase tracking-widest text-white/20">Variance Maximization</div>
    </div>
  );
};

const DecompositionVisualizer = ({ type, results }: { type: string, results: any }) => {
  const [step, setStep] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);

  const toArr = (m: any) => {
    if (!m) return [[1, 0], [0, 1]];
    if (Array.isArray(m)) return m;
    if (typeof m.toArray === 'function') return m.toArray();
    return [[1, 0], [0, 1]];
  };

  useEffect(() => {
    if (!svgRef.current || !results) return;
    const svg = d3.select(svgRef.current);
    const width = 300;
    const height = 300;
    const margin = 40;
    svg.selectAll("*").remove();

    const xScale = d3.scaleLinear().domain([-3, 3]).range([margin, width - margin]);
    const yScale = d3.scaleLinear().domain([-3, 3]).range([height - margin, margin]);

    // Helper to draw a grid/circle under a transformation
    const drawTransform = (m: number[][], color: string, opacity: number, isFinal = false) => {
      const gridPoints = [];
      for (let i = -2; i <= 2; i += 0.5) {
        gridPoints.push({ x1: i, y1: -2, x2: i, y2: 2 });
        gridPoints.push({ x1: -2, y1: i, x2: 2, y2: i });
      }

      gridPoints.forEach(line => {
        const p1 = [line.x1 * m[0][0] + line.y1 * m[0][1], line.x1 * m[1][0] + line.y1 * m[1][1]];
        const p2 = [line.x2 * m[0][0] + line.y2 * m[0][1], line.x2 * m[1][0] + line.y2 * m[1][1]];
        svg.append("line")
          .attr("x1", xScale(p1[0]))
          .attr("y1", yScale(p1[1]))
          .attr("x2", xScale(p2[0]))
          .attr("y2", yScale(p2[1]))
          .attr("stroke", color)
          .attr("stroke-width", isFinal ? 1.5 : 0.5)
          .attr("stroke-opacity", opacity);
      });

      // Draw unit circle
      const circlePoints = d3.range(0, 2 * Math.PI + 0.1, 0.1).map(t => {
        const x = Math.cos(t);
        const y = Math.sin(t);
        return [x * m[0][0] + y * m[0][1], x * m[1][0] + y * m[1][1]];
      });

      const lineGen = d3.line().x(d => xScale(d[0])).y(d => yScale(d[1]));
      svg.append("path")
        .attr("d", lineGen(circlePoints as any))
        .attr("fill", color)
        .attr("fill-opacity", 0.1)
        .attr("stroke", color)
        .attr("stroke-width", 2);
    };

    let currentMatrix = [[1, 0], [0, 1]];
    
    if (type === 'SVD') {
      const V = toArr(results.V);
      const S = toArr(results.Sigma || results.S);
      const Sigma = Array.isArray(S[0]) ? S : [[S[0], 0], [0, S[1]]];
      const U = toArr(results.U === 'Calculated' ? [[1,0],[0,1]] : results.U);

      if (step >= 1) currentMatrix = math.multiply(math.transpose(V), currentMatrix) as any;
      if (step >= 2) currentMatrix = math.multiply(Sigma, currentMatrix) as any;
      if (step >= 3) currentMatrix = math.multiply(U, currentMatrix) as any;
    } else if (type === 'LU') {
      const L = toArr(results.L);
      const U = toArr(results.U);
      if (step >= 1) currentMatrix = math.multiply(U, currentMatrix) as any;
      if (step >= 2) currentMatrix = math.multiply(L, currentMatrix) as any;
    } else if (type === 'QR') {
      const Q = toArr(results.Q);
      const R = toArr(results.R);
      if (step >= 1) currentMatrix = math.multiply(R, currentMatrix) as any;
      if (step >= 2) currentMatrix = math.multiply(Q, currentMatrix) as any;
    } else if (type === 'EIGEN') {
      const V = toArr(results.vectors);
      const L = toArr(results.values);
      const Lambda = Array.isArray(L[0]) ? L : [[L[0], 0], [0, L[1]]];
      const Vi = math.inv(V) as any;
      if (step >= 1) currentMatrix = math.multiply(Vi, currentMatrix) as any;
      if (step >= 2) currentMatrix = math.multiply(Lambda, currentMatrix) as any;
      if (step >= 3) currentMatrix = math.multiply(V, currentMatrix) as any;
    }

    drawTransform([[1, 0], [0, 1]], "rgba(255,255,255,0.05)", 0.2);
    drawTransform(currentMatrix, "var(--color-oasis-accent)", 0.8, true);

  }, [type, results, step]);

  const steps = {
    SVD: ["Identity", "Rotate (Vᵀ)", "Scale (Σ)", "Rotate (U)"],
    LU: ["Identity", "Upper (U)", "Lower (L)"],
    QR: ["Identity", "Upper (R)", "Orthogonal (Q)"],
    EIGEN: ["Identity", "Basis Change (V⁻¹)", "Scale (Λ)", "Basis Change (V)"]
  };

  const currentSteps = (steps as any)[type] || [];

  useEffect(() => {
    setStep(0);
  }, [type, results]);

  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setStep(s => (s + 1) % currentSteps.length);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentSteps.length]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative glass p-4 rounded-2xl border-white/5">
        <svg ref={svgRef} width="300" height="300" className="rounded-xl overflow-hidden" />
        <div className="absolute top-4 right-4 flex flex-col gap-1 items-end">
          <span className="text-[8px] uppercase tracking-widest text-white/20">Step</span>
          <span className="text-xl font-serif italic text-oasis-accent">{step + 1}/{currentSteps.length}</span>
        </div>
        
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-oasis-accent/20 border border-oasis-accent/40 flex items-center justify-center text-oasis-accent hover:bg-oasis-accent/40 transition-all"
        >
          {isPlaying ? <span className="text-[8px]">STOP</span> : <Play size={12} fill="currentColor" />}
        </button>
      </div>
      
      <div className="flex gap-2">
        {currentSteps.map((s: string, i: number) => (
          <button
            key={i}
            onClick={() => {
              setStep(i);
              setIsPlaying(false);
            }}
            className={cn(
              "px-4 py-2 rounded-full text-[10px] uppercase tracking-widest transition-all border",
              step === i 
                ? "bg-oasis-accent text-oasis-bg border-oasis-accent" 
                : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
            )}
          >
            {s}
          </button>
        ))}
      </div>
      <p className="text-[10px] uppercase tracking-widest text-white/30 text-center max-w-[250px] min-h-[24px]">
        {step === 0 ? "Starting with the unit basis" : `Applying ${currentSteps[step]} transformation`}
      </p>
    </div>
  );
};
const MatrixDisplay = ({ matrix, label, color = "white", role }: { matrix: any, label: string, color?: string, role?: string }) => {
  if (matrix === null || matrix === undefined) return null;
  
  let data: any[];
  if (Array.isArray(matrix)) {
    data = matrix;
  } else if (typeof matrix === 'object' && typeof matrix.toArray === 'function') {
    data = matrix.toArray();
  } else {
    data = [matrix]; // Fallback for strings or single values
  }
  
  const isVector = !Array.isArray(data[0]) && !(typeof data[0] === 'object' && typeof data[0]?.toArray === 'function');

  return (
    <div className="flex flex-col items-center gap-2 group relative">
      <span className="text-[10px] uppercase tracking-widest text-white/20 font-mono">{label}</span>
      <div className="relative p-4 bg-white/5 rounded-xl border border-white/10 font-mono text-sm transition-all group-hover:border-oasis-accent/40 group-hover:bg-white/10">
        <div className="absolute -left-1 inset-y-2 w-1 bg-white/20 rounded-full group-hover:bg-oasis-accent/40" />
        <div className="absolute -right-1 inset-y-2 w-1 bg-white/20 rounded-full group-hover:bg-oasis-accent/40" />
        <div className="grid gap-2">
          {isVector ? (
            <div className="flex gap-4">
              {data.map((v: any, i: number) => (
                <span key={i} style={{ color }} className="font-bold">{typeof v === 'number' ? v.toFixed(2) : v.toString()}</span>
              ))}
            </div>
          ) : (
            data.map((row: any, i: number) => {
              const rowData = Array.isArray(row) ? row : (typeof row === 'object' && typeof row.toArray === 'function' ? row.toArray() : [row]);
              return (
                <div key={i} className="flex gap-4 justify-center">
                  {rowData.map((v: any, j: number) => (
                    <span key={j} className="w-12 text-center font-bold" style={{ color }}>
                      {typeof v === 'number' ? v.toFixed(2) : v.toString()}
                    </span>
                  ))}
                </div>
              );
            })
          )}
        </div>
      </div>
      {role && (
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-48 p-2 bg-black/80 border border-white/10 rounded-lg text-[10px] text-white/60 text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 backdrop-blur-sm">
          {role}
        </div>
      )}
    </div>
  );
};

const DecompositionGallery = () => {
  const [selected, setSelected] = useState('LU');
  const [matrix, setMatrix] = useState([[2, 1], [1, 2]]);

  const handleInputChange = (r: number, c: number, val: string) => {
    const num = parseFloat(val) || 0;
    const newMatrix = [...matrix];
    newMatrix[r][c] = num;
    setMatrix(newMatrix);
  };

  const getDecomposition = (): any => {
    try {
      const A = math.matrix(matrix);
      switch (selected) {
        case 'LU': {
          const { L, U, p } = math.lup(A);
          return { L, U, p };
        }
        case 'QR': {
          const { Q, R } = math.qr(A);
          return { Q, R };
        }
        case 'EIGEN': {
          const { values, eigenvectors } = math.eigs(A);
          // Convert eigenvectors to a matrix where they are columns
          const V = math.transpose(math.matrix(eigenvectors.map((e: any) => e.vector)));
          return { values, vectors: V };
        }
        case 'SVD': {
          if ((math as any).svd) {
            return (math as any).svd(A);
          }
          const AtA = math.multiply(math.transpose(A), A);
          const { values, eigenvectors } = math.eigs(AtA);
          const V = math.transpose(math.matrix(eigenvectors.map((e: any) => e.vector)));
          const Sigma = (values as any).map((v: any) => Math.sqrt(Math.max(0, v)));
          return { U: 'Calculated', Sigma, V };
        }
        default:
          return null;
      }
    } catch (e) {
      return null;
    }
  };

  const results: any = getDecomposition();

  const decompositions = [
    {
      id: 'LU',
      category: 'Linear Systems',
      title: 'LU Decomposition',
      formula: 'A = LU',
      desc: 'Splits a square matrix into Lower and Upper triangular forms. The foundation of solving Ax = b.',
      properties: ['L: Lower triangular (1s on diagonal)', 'U: Upper triangular (echelon form)', 'Efficient for multiple b vectors'],
    },
    {
      id: 'QR',
      category: 'Orthogonality',
      title: 'QR Decomposition',
      formula: 'A = QR',
      desc: 'Orthogonalizes the columns of A. Essential for Least Squares and stability.',
      properties: ['Q: Orthogonal (QᵀQ = I)', 'R: Upper triangular', 'Gram-Schmidt process'],
    },
    {
      id: 'SVD',
      category: 'Generalized',
      title: 'Singular Value Decomposition',
      formula: 'A = UΣVᵀ',
      desc: 'The most powerful tool in linear algebra. Works for any matrix.',
      properties: ['U, V: Orthogonal rotations', 'Σ: Diagonal scaling (singular values)', 'Used in PCA and compression'],
    },
    {
      id: 'EIGEN',
      category: 'Orthogonality',
      title: 'Eigendecomposition',
      formula: 'A = VΛV⁻¹',
      desc: 'Reveals the characteristic directions of a square matrix.',
      properties: ['V: Eigenvectors', 'Λ: Eigenvalues', 'Requires n independent eigenvectors'],
    }
  ];

  const comparisonData = [
    { name: 'LU', scope: 'Square', use: 'Solving Ax = b' },
    { name: 'QR', scope: 'Any', use: 'Least Squares' },
    { name: 'SVD', scope: 'Any', use: 'Compression, PCA' },
    { name: 'Eigen', scope: 'Square', use: 'Dynamic Systems' },
    { name: 'Cholesky', scope: 'Positive Definite', use: 'Fast Solving' },
  ];

  return (
    <section id="decompositions" className="py-32 px-8 max-w-7xl mx-auto">
      <SectionHeader 
        number="04"
        title="The Art of Decomposition"
        subtitle="Matrices are complex structures. Decomposition is the act of breaking them into simpler, meaningful pieces."
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mt-24">
        {/* Sidebar Navigation */}
        <div className="space-y-4">
          <div className="p-6 glass rounded-2xl border-oasis-accent/20 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Settings2 size={14} className="text-oasis-accent" />
              <h4 className="font-mono text-[10px] uppercase tracking-widest text-white/60">Input Matrix A</h4>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {matrix.map((row, r) => row.map((val, c) => (
                <input
                  key={`${r}-${c}`}
                  type="number"
                  value={val}
                  onChange={(e) => handleInputChange(r, c, e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-center font-mono text-sm focus:border-oasis-accent outline-none transition-colors"
                />
              )))}
            </div>
            <button 
              onClick={() => setMatrix([[Math.floor(Math.random()*5), Math.floor(Math.random()*5)], [Math.floor(Math.random()*5), Math.floor(Math.random()*5)]])}
              className="w-full mt-4 flex items-center justify-center gap-2 py-2 text-[10px] uppercase tracking-widest text-white/40 hover:text-oasis-accent transition-colors"
            >
              <RefreshCw size={12} /> Randomize
            </button>
          </div>

          {decompositions.map(d => (
            <button
              key={d.id}
              onClick={() => setSelected(d.id)}
              className={cn(
                "w-full text-left p-4 rounded-xl transition-all border",
                selected === d.id 
                  ? "bg-oasis-accent/10 border-oasis-accent text-white" 
                  : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
              )}
            >
              <span className="text-[10px] uppercase tracking-widest block mb-1 opacity-50">{d.category}</span>
              <span className="font-serif italic text-lg">{d.title}</span>
            </button>
          ))}
        </div>

        {/* Main Display */}
        <div className="lg:col-span-3 space-y-12">
          <AnimatePresence mode="wait">
            {decompositions.filter(d => d.id === selected).map(d => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass p-12 rounded-3xl border-white/5 min-h-[500px] flex flex-col"
              >
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
                  <div className="max-w-md">
                    <h3 className="text-4xl font-serif italic mb-4">{d.title}</h3>
                    <p className="text-oasis-ink/60 leading-relaxed mb-6">{d.desc}</p>
                    <div className="space-y-2">
                      {d.properties.map((p, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm text-white/80">
                          <Zap size={14} className="text-oasis-accent" />
                          {p}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-6 bg-black/40 rounded-2xl border border-oasis-accent/20">
                    <span className="text-[10px] uppercase tracking-widest text-white/20 block mb-2">Fundamental Equation</span>
                    <code className="text-2xl text-oasis-accent font-mono">{d.formula}</code>
                  </div>
                </div>

                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-12 items-center py-12 bg-white/[0.02] rounded-2xl border border-white/5 px-12">
                  <div className="flex flex-col items-center justify-center gap-8">
                    <div className="flex flex-wrap items-center justify-center gap-6">
                      <MatrixDisplay matrix={matrix} label="Input A" />
                      <ArrowRight className="text-oasis-accent shrink-0" />
                      
                      {selected === 'LU' && results && (
                        <>
                          <MatrixDisplay matrix={results.L} label="Lower L" color="var(--color-oasis-teal)" role="Lower triangular matrix containing the row operations used to reduce A." />
                          <MatrixDisplay matrix={results.U} label="Upper U" color="var(--color-oasis-accent)" role="Upper triangular matrix representing the final echelon form of A." />
                        </>
                      )}

                      {selected === 'QR' && results && (
                        <>
                          <MatrixDisplay matrix={results.Q} label="Orthogonal Q" color="var(--color-oasis-teal)" role="Orthogonal matrix whose columns form an orthonormal basis for the column space." />
                          <MatrixDisplay matrix={results.R} label="Upper R" color="var(--color-oasis-accent)" role="Upper triangular matrix containing the coefficients of the projection." />
                        </>
                      )}

                      {selected === 'EIGEN' && results && (
                        <>
                          <MatrixDisplay matrix={results.vectors} label="Eigenvectors V" color="var(--color-oasis-teal)" role="The characteristic directions that only get scaled by the transformation." />
                          <MatrixDisplay matrix={results.values} label="Eigenvalues Λ" color="var(--color-oasis-accent)" role="The scaling factors corresponding to each eigenvector." />
                        </>
                      )}

                      {selected === 'SVD' && results && (
                        <>
                          <MatrixDisplay matrix={results.U === 'Calculated' ? 'U' : results.U} label="U" color="var(--color-oasis-teal)" role="Left singular vectors: the output basis (rotation)." />
                          <MatrixDisplay matrix={results.Sigma || results.S} label="Σ" color="white" role="Singular values: the scaling factors along the principal axes." />
                          <MatrixDisplay matrix={results.V} label="Vᵀ" color="var(--color-oasis-accent)" role="Right singular vectors: the input basis (rotation)." />
                        </>
                      )}

                      {!results && (
                        <div className="text-destructive font-mono text-xs">Invalid Matrix for this decomposition</div>
                      )}
                    </div>
                    
                    {results && (
                      <div className="w-full p-4 bg-oasis-accent/5 rounded-xl border border-oasis-accent/10 text-[10px] font-mono text-oasis-accent/60 text-center">
                        Verification: {selected === 'LU' ? 'L × U ≈ A' : selected === 'QR' ? 'Q × R ≈ A' : selected === 'EIGEN' ? 'V × Λ × V⁻¹ ≈ A' : 'U × Σ × Vᵀ ≈ A'}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-center justify-center border-l border-white/5 pl-12">
                    <span className="text-[10px] uppercase tracking-widest text-white/20 mb-8">Geometric Transformation Steps</span>
                    <DecompositionVisualizer type={selected} results={results} />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Comparison Table */}
          <div className="glass rounded-3xl border-white/5 overflow-hidden">
            <div className="p-6 border-b border-white/5 bg-white/[0.02]">
              <h4 className="font-mono text-xs uppercase tracking-widest text-white/40">Comparison Table</h4>
            </div>
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-white/5 text-oasis-teal">
                  <th className="p-6">Decomposition</th>
                  <th className="p-6">Scope</th>
                  <th className="p-6">Primary Use</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-6 text-white font-bold">{row.name}</td>
                    <td className="p-6 text-white/60">{row.scope}</td>
                    <td className="p-6 text-oasis-accent">{row.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

const MLApplications = () => {
  return (
    <section id="applications" className="py-32 px-8 bg-white/[0.02] border-y border-white/5">
      <div className="max-w-7xl mx-auto">
        <SectionHeader 
          number="05"
          title="Machine Learning"
          subtitle="Linear algebra is the engine of AI. From the weights of a neural network to the dimensions of latent space."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-24">
          <div className="space-y-8">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 rounded-2xl bg-oasis-teal/10 flex items-center justify-center shrink-0">
                <Brain className="text-oasis-teal" size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-serif italic mb-4">Neural Networks</h3>
                <p className="text-oasis-ink/60 leading-relaxed">
                  Every layer in a neural network is essentially a matrix multiplication followed by a non-linear activation. 
                  Training is the process of finding the "perfect" matrix.
                </p>
              </div>
            </div>
            <NeuralNetworkViz />
          </div>

          <div className="space-y-8">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 rounded-2xl bg-oasis-accent/10 flex items-center justify-center shrink-0">
                <Maximize className="text-oasis-accent" size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-serif italic mb-4">Dimensionality Reduction (PCA)</h3>
                <p className="text-oasis-ink/60 leading-relaxed">
                  PCA uses the Eigendecomposition of a covariance matrix to find the directions of maximum variance, 
                  allowing us to compress data while losing minimal information.
                </p>
              </div>
            </div>
            <PCAViz />
          </div>
        </div>
      </div>
    </section>
  );
};

// --- Main App ---

export default function App() {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);
  const [playgroundMatrix, setPlaygroundMatrix] = useState([[1, 0.5], [0.5, 1]]);

  return (
    <div className="relative min-h-screen selection:bg-oasis-accent selection:text-white overflow-x-hidden">
      <VectorField />
      <div className="atmosphere fixed inset-0 -z-20 pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 px-8 py-6 flex justify-between items-center mix-blend-difference">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-oasis-accent rounded-full flex items-center justify-center">
            <span className="text-oasis-bg font-bold text-xs">O</span>
          </div>
          <span className="font-mono text-sm tracking-tighter uppercase font-bold">LinOasis</span>
        </div>
        <div className="hidden md:flex gap-12 items-center">
          {['Intuition', 'Decompositions', 'Applications', 'OITS'].map((item) => (
            <a 
              key={item} 
              href={item === 'OITS' ? 'https://oasis-institute-of-technology-science.github.io/' : `#${item.toLowerCase()}`} 
              target={item === 'OITS' ? '_blank' : undefined}
              rel={item === 'OITS' ? 'noopener noreferrer' : undefined}
              className="text-xs uppercase tracking-widest hover:text-oasis-accent transition-colors"
            >
              {item}
            </a>
          ))}
          <a 
            href="https://github.com/Oasis-Institute-of-Technology-Science" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <Github size={18} />
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section 
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="h-screen flex flex-col items-center justify-center px-8 text-center relative"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <span className="font-mono text-oasis-accent text-xs tracking-[0.4em] uppercase mb-6 block">
            Oasis Institute of Technology Science
          </span>
          <h1 className="text-[15vw] md:text-[12vw] font-serif italic leading-[0.85] tracking-tighter mb-8 text-glow">
            LinOasis
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-oasis-ink/60 leading-relaxed font-light">
            An epic journey into the geometric soul of Linear Algebra. 
            Beyond calculations, we seek the <span className="text-oasis-accent italic">intuition</span> of the machine.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
        >
          <span className="font-mono text-[10px] uppercase tracking-widest opacity-40">Begin the Descent</span>
          <ChevronDown className="animate-bounce text-oasis-accent" size={20} />
        </motion.div>
      </motion.section>

      {/* Core Intuition Section */}
      <section id="intuition" className="py-32 px-8 max-w-7xl mx-auto">
        <SectionHeader 
          number="01"
          title="The Core Intuition"
          subtitle="Linear algebra is the language of transformations. We don't just solve equations; we witness the bending and stretching of space itself."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={Maximize2}
            title="SVD: The Anatomy"
            description="Singular Value Decomposition isn't just a formula. It's the ultimate rotation and scaling that reveals the hidden axes of any data."
          />
          <FeatureCard 
            icon={Layers}
            title="Eigenspaces"
            description="Discover the directions that remain unchanged amidst the chaos of transformation. The true DNA of a matrix."
          />
          <FeatureCard 
            icon={Box}
            title="The Four Subspaces"
            description="Gilbert Strang's masterpiece. Understand how the Row Space, Nullspace, Column Space, and Left Nullspace define the universe of a matrix."
          />
        </div>

        <MatrixPlayground initialMatrix={playgroundMatrix} />
      </section>

      <MatrixWorld onTestMatrix={setPlaygroundMatrix} />

      <DecompositionGallery />

      <MLApplications />

      {/* Footer */}
      <footer className="py-24 px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="text-center md:text-left">
            <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
              <div className="w-6 h-6 bg-oasis-accent rounded-full" />
              <span className="font-mono text-sm tracking-tighter uppercase font-bold">LinOasis</span>
            </div>
            <p className="text-oasis-ink/40 text-sm max-w-xs">
              A project by the Oasis Institute of Technology Science. 
              Dedicated to the beauty of mathematics.
            </p>
          </div>

          <div className="flex gap-12 text-xs uppercase tracking-[0.2em] font-mono text-oasis-ink/40">
            <a href="#" className="hover:text-oasis-accent transition-colors">Twitter</a>
            <a href="https://github.com/Oasis-Institute-of-Technology-Science" className="hover:text-oasis-accent transition-colors">GitHub</a>
            <a href="#" className="hover:text-oasis-accent transition-colors">Discord</a>
          </div>

          <div className="text-center md:text-right">
            <p className="text-xs font-mono text-oasis-ink/40 uppercase tracking-widest mb-2">
              ceaserzhao(Oasis Company)
            </p>
            <p className="text-xs font-mono text-oasis-ink/20 uppercase tracking-widest">
              © 2026 Oasis Institute
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

