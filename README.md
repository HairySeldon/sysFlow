This package is a wrapper for ReactFlow designed for visualizing and interacting with complex systems. Support is made for both highly concurrent systems, such as computer architecture or large networkss, and for highly seqeuntial flows, like program flows and task dependencies. This package provides features usesful specifically to system development.

# 1. Install root & workspace dependencies
npm install

# 2. Build the @sysflow/core package
npm run build --workspace=@sysflow/core

# 3. Launch the reference applications
npm run dev --workspace=@sysflow/demo
