import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import * as d3 from 'd3';
import styled from 'styled-components';
import { dia } from 'jointjs';

const HomeContainer = styled.div`
  display: flex;
  height: 100vh;
`;

const Column = styled.div`
  padding: 10px;
  background-color: #f4f4f4;
`;

const LeftColumn = styled(Column)`
  width: 25%;
`;

const MiddleColumn = styled(Column)`
  width: 50%;
  display: flex;
  flex-direction: column;
`;

const RightColumn = styled(Column)`
  width: 25%;
`;

const SectionContainer = styled.div`
  background-color: #ffffff;
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const SearchBar = styled.div`
  display: flex;
  margin-bottom: 10px;

  input {
    flex: 1;
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ddd;
  }

  button {
    padding: 10px 20px;
    border: none;
    background-color: #512da8;
    color: #fff;
    border-radius: 5px;
    cursor: pointer;
  }
`;

const PredictionButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;

  button {
    padding: 8px 10px;
    border: none;
    background-color: #512da8;
    color: #fff;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    transition: transform 0.2s;

    &:hover {
      transform: scale(1.05);
    }
  }
`;

const FactorGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  max-height: 200px;
  overflow-y: auto;
  padding: 10px;
`;

const FactorItem = styled.div`
  background-color: #b3e5fc;
  border: 1px solid #0288d1;
  padding: 5px 10px;
  margin: 5px;
  border-radius: 5px;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }
`;

const DragDropArea = styled.div`
  flex-grow: 1;
  border: 2px dashed #ddd;
  border-radius: 10px;
  padding: 20px;
  min-height: 200px;
`;

const ModelActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModelNameInput = styled.input`
  flex: 1;
  padding: 8px;
  margin-right: 10px;
  border-radius: 5px;
  border: 1px solid #ddd;
`;

const Button = styled.button`
  padding: 8px 15px;
  border: none;
  background-color: #512da8;
  color: #fff;
  border-radius: 5px;
  cursor: pointer;
  margin-left: 5px;
`;

export const DeleteButton = styled.span`
  color: #f44336;
  margin-left: 5px;
  cursor: pointer;
`;

const Home = () => {
  const [modelName, setModelName] = useState('');
  const [modelQuality, setModelQuality] = useState('Not trained yet');
  const [selectedFactors, setSelectedFactors] = useState([]);
  const [targetVariables] = useState(['Pecan', 'Urban', 'Cotton', 'Water Quality', 'Water Availability']);
  const [selectedTarget, setSelectedTarget] = useState('');
  const [adminFactors, setAdminFactors] = useState([]);
  const [userFactors, setUserFactors] = useState([]);
  const [modelLevels, setModelLevels] = useState([]);
  const [showVisualization, setShowVisualization] = useState(false);
  const [showAddFactorModel, setShowAddFactorModel] = useState(false);
  const [newFactor, setNewFactor] = useState({
    name: '',
    description: '',
    timeSeries: new Array(25).fill(null)
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFactors, setFilteredFactors] = useState([]);

  const graphRef = useRef(null);

  useEffect(() => {
    loadFactors();
    loadModels();
  }, []);

  const loadFactors = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/factors');
      setAdminFactors(response.data.filter(factor => factor.creator === 'admin'));
      setUserFactors(response.data.filter(factor => factor.creator !== 'admin'));
    } catch (error) {
      console.error('Error loading factors:', error);
    }
  };

  const loadModels = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/models');
      if (response.data && typeof response.data === 'object') {
        setModelLevels(Object.keys(response.data).map(levelKey => ({
          level: parseInt(levelKey, 10),
          models: response.data[levelKey]
        })));
      } else {
        console.error('Unexpected API response format:', response.data);
        setModelLevels([]);
      }
    } catch (error) {
      console.error('Error loading models:', error);
      setModelLevels([]);
    }
  };

  const onSearchInput = () => {
    if (searchTerm.length > 0) {
      setFilteredFactors([...adminFactors, ...userFactors].filter(factor =>
        factor.name.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    } else {
      setFilteredFactors([]);
    }
  };

  const addFactorToDragArea = (factor) => {
    if (!selectedFactors.some(f => f._id === factor._id)) {
      setSelectedFactors([...selectedFactors, { ...factor }]);
    }
    setSearchTerm('');
    setFilteredFactors([]);
  };

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const { source, destination } = result;

    if (source.droppableId === destination.droppableId) {
      const items = Array.from(selectedFactors);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);
      setSelectedFactors(items);
    } else {
      const sourceList = source.droppableId === 'adminFactors' ? adminFactors :
                         source.droppableId === 'userFactors' ? userFactors :
                         selectedFactors;
      const destList = destination.droppableId === 'selectedFactors' ? selectedFactors :
                       destination.droppableId === 'adminFactors' ? adminFactors :
                       userFactors;

      const sourceItems = Array.from(sourceList);
      const destItems = Array.from(destList);
      const [removedItem] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removedItem);

      if (source.droppableId === 'adminFactors') {
        setAdminFactors(sourceItems);
      } else if (source.droppableId === 'userFactors') {
        setUserFactors(sourceItems);
      } else {
        setSelectedFactors(sourceItems);
      }

      if (destination.droppableId === 'selectedFactors') {
        setSelectedFactors(destItems);
      } else if (destination.droppableId === 'adminFactors') {
        setAdminFactors(destItems);
      } else {
        setUserFactors(destItems);
      }
    }
  };

  const removeFactor = (factor) => {
    setSelectedFactors(selectedFactors.filter(f => f._id !== factor._id));
  };

  const visualizeModel = (model) => {
    setShowVisualization(true);

    const svg = d3.select(graphRef.current);
    svg.selectAll("*").remove();

    const width = svg.attr("width");
    const height = svg.attr("height");

    const nodes = Array.from(new Set(model.links.flatMap(link => [link.source, link.target]))).map(id => ({ id }));
    const links = model.links;

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
      .selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke-width", d => Math.sqrt(d.weight))
      .attr("stroke", "black");

    const node = svg.append("g")
      .selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .attr("r", 10)
      .attr("fill", "blue")
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
    });

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  };

  const retrainModel = async () => {
    const modelData = {
      name: modelName,
      factors: selectedFactors,
      target: selectedTarget
    };
    try {
      const response = await axios.post('http://localhost:5001/retrain', modelData);
      setModelQuality(response.data.quality);
    } catch (error) {
      console.error('Error retraining model:', error);
    }
  };

  return (
    <HomeContainer>
      <LeftColumn>
        <SectionContainer>
          <SearchBar>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onInput={onSearchInput}
              placeholder="Search factors..."
            />
            <button onClick={onSearchInput}>Search</button>
          </SearchBar>
          {filteredFactors.length > 0 && (
            <div>
              {filteredFactors.map(factor => (
                <FactorItem key={factor._id} onClick={() => addFactorToDragArea(factor)}>
                  {factor.name}
                </FactorItem>
              ))}
            </div>
          )}
        </SectionContainer>

        <SectionContainer>
          <PredictionButtons>
            {targetVariables.map(variable => (
              <button key={variable} onClick={() => setSelectedTarget(variable)}>{variable}</button>
            ))}
          </PredictionButtons>
        </SectionContainer>

        <SectionContainer>
          <h3>Factors</h3>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="adminFactors">
              {(provided) => (
                <FactorGrid {...provided.droppableProps} ref={provided.innerRef}>
                  {adminFactors.map((factor, index) => (
                    <Draggable key={factor._id} draggableId={factor._id} index={index}>
                      {(provided) => (
                        <FactorItem
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          {factor.name}
                        </FactorItem>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </FactorGrid>
              )}
            </Droppable>
          </DragDropContext>
        </SectionContainer>

        <SectionContainer>
          <h3>Custom Factors</h3>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="userFactors">
              {(provided) => (
                <FactorGrid {...provided.droppableProps} ref={provided.innerRef}>
                  {userFactors.map((factor, index) => (
                    <Draggable key={factor._id} draggableId={factor._id} index={index}>
                      {(provided) => (
                        <FactorItem
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          {factor.name}
                        </FactorItem>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </FactorGrid>
              )}
            </Droppable>
          </DragDropContext>
        </SectionContainer>

        <Button onClick={() => setShowAddFactorModel(true)}>Add Factor</Button>
      </LeftColumn>

      <MiddleColumn>
        <ModelActions>
          <ModelNameInput
            type="text"
            placeholder="Enter model name"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
          />
          <Button onClick={retrainModel}>Retrain</Button>
          <Button onClick={() => {}}>Duplicate</Button>
          <Button onClick={() => {}}>Save</Button>
        </ModelActions>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="selectedFactors">
            {(provided) => (
              <DragDropArea {...provided.droppableProps} ref={provided.innerRef}>
                <h3>Drag and Drop Factors Here</h3>
                {selectedFactors.map((factor, index) => (
                  <Draggable key={factor._id} draggableId={factor._id} index={index}>
                    {(provided) => (
                      <FactorItem
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        {factor.name}
                        <span onClick={() => removeFactor(factor)}>&#10006;</span>
                      </FactorItem>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </DragDropArea>
            )}
          </Droppable>
        </DragDropContext>

        <div>
          <Button onClick={() => {}}>Delete Model</Button>
          <span>Training Quality: {modelQuality}</span>
        </div>
      </MiddleColumn>

      <RightColumn>
        <SectionContainer>
          <h3>Existing Models</h3>
          {modelLevels.map(level => (
            <div key={level.level}>
              <h4>User Level {level.level}</h4>
              <ul>
                {level.models.map(model => (
                  <li key={model.name}>
                    <span>{model.name} - Quality: {model.quality}</span>
                    <Button onClick={() => visualizeModel(model)}>Visualize</Button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </SectionContainer>
      </RightColumn>

      {showVisualization && (
        <div className="visualization">
          <svg ref={graphRef} width="800" height="600"></svg>
        </div>
      )}

      {/* Add Factor Modal would go here */}
    </HomeContainer>
  );
};

export default Home;



//
// import React, { useState, useEffect } from "react";
// import "./Home.css";
//
// const App = () => {
//   const [models, setModels] = useState([]);
//
//   useEffect(() => {
//     // Simulating fetching models data
//     const fetchedModels = [
//       { name: "Model 1", description: "A model about water quality" },
//       { name: "Model 2", description: "A model about urban area growth" },
//       { name: "Model 3", description: "A model about pecan area" },
//     ];
//     setModels(fetchedModels);
//   }, []);
//
//   const createModel = () => {
//     const newModel = { name: `Model ${models.length + 1}`, description: "New Model" };
//     setModels([...models, newModel]);
//   };
//
//   return (
//     <div className="container">
//       <header className="header">
//         <h1>AI Mental Modeler</h1>
//       </header>
//       <div className="content">
//         <aside className="sidebar">
//           <div className="section">
//             <input type="text" placeholder="Search..." className="search-bar" />
//             <div className="buttons">
//               <button className="button">Pecan</button>
//               <button className="button">Urban</button>
//               <button className="button">Water</button>
//               <button className="button">Cotton</button>
//             </div>
//           </div>
//           <div className="section">
//             <h2>Admin Factors</h2>
//             <button className="add-factor-button">Add Factor</button>
//           </div>
//         </aside>
//         <main className="main-content">
//           <div className="model-controls">
//             <h2>Manage Models</h2>
//             <button className="control-button" onClick={createModel}>Create New Model</button>
//             <button className="control-button">Save Model</button>
//             <button className="control-button">Retrain Model</button>
//             <button className="control-button delete-button">Delete Model</button>
//           </div>
//           <div className="model-list">
//             {models.map((model, index) => (
//               <div key={index} className="model-item">
//                 <h3>{model.name}</h3>
//                 <p>{model.description}</p>
//               </div>
//             ))}
//           </div>
//         </main>
//       </div>
//       <footer className="footer">
//         <p>&copy; 2024 AI Mental Modeler</p>
//       </footer>
//     </div>
//   );
// };
//
// export default App;
