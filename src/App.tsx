import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import axios from 'axios';



interface AppState {
  gridData: string[];
  checkboxChecked: boolean;
  textInput: string;
  dropdownSelection: string[];
  file: File | null;
  additionalTextInput: string;
  responseText: string;
  selectedIndex: string;
  index_request: boolean;
  new_index: string;
  query: string;
  server_file_list: string[];
  generate_spinner: boolean;
  index_dropdown_selection: string[],
  new_tmp_check: boolean,
  tmp_folder_list:string[],
  selectedTmpFolder: string,
  tmpDropdownSelection: string[],
  new_tmp_folder: string,
}

interface Index {
  health: string,
  status: string,
  index: string,
  uuid: string,
  pri: string,
  rep: string,
  docs_count: number,
  docs_deleted: number,
  store_size: string,
  pri_store_size: string
}

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    gridData: [],
    checkboxChecked: false,
    textInput: '',
    dropdownSelection: [],
    tmpDropdownSelection:[],
    file: null,
    additionalTextInput: '',
    responseText: '',
    selectedIndex: '',
    index_request: false,
    query: '',
    new_index: '',
    server_file_list: [],
    generate_spinner: false,
    index_dropdown_selection: [],
    new_tmp_check: false,
    tmp_folder_list:[],
    selectedTmpFolder: '',
    new_tmp_folder: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  if(import.meta.env.VITE_ENVIRONMENT == "dev"){
    import.meta.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
  }  

  const datastore_base_url:string = import.meta.env.VITE_OPENSEARCH_BASE_URL
  const backend_base_uri: string = import.meta.env.VITE_BACKEND_BASE_URL 

  const fetchData = async () => {
    let url:string = datastore_base_url + "/_cat/indices" 
    // axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';
    try {
      const serverFolder = await axios.get(backend_base_uri.concat('/folders'));
      let folder:string[] = await serverFolder.data['folders'];
      /*
      console.log(serverFolder.data['folders']);
      folder.forEach(elem => {
        if(!elem.startsWith(".")){
          folder.push(elem);
        }
      });
      */
      let help: string = ''
      if(folder.length > 0){
        let help:string  = folder[0]
      }
      const serverFiles = await axios.post(backend_base_uri + '/files',{
        tmp_folder: help
      });
      let files:string[] = await serverFiles.data['files'];
      let fileList:string[] = []
        if(files.length > 0){
        files.forEach(elem => {
          if(!elem.startsWith('.')){
            fileList.push(elem); 
          } 
        });
      }
      let response = await axios.get(url, {
        headers: {
          "Accept": "application/json"
        },
        auth: {
          username: import.meta.env.VITE_OPENSEARCH_USER,
          password: import.meta.env.VITE_OPENSEARCH_PW
        }
      });
      const data:Index[] = await response.data;
      let dropdownOptions:string[] = []
      data.forEach(elem => {
        if(!elem.index.startsWith("security") && !elem.index.startsWith(".") && !elem.index.startsWith("opensearch")){ 
          dropdownOptions.push(elem.index);
        }
      });
      setState((prevState) => ({ ...prevState ,
        dropdownSelection: dropdownOptions, 
        tmpDropdownSelection: folder,
        server_file_list: fileList, 
        tmp_folder_list: folder
      }));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  const handleInputChange = (field: keyof AppState, value: any) => {
    setState((prevState) => ({ ...prevState, [field]: value }));
  };

  const handleSubmitFile = async () => {
    let data = new FormData()
    if(state.file){
      data.append("files", state.file);
      if(state.selectedTmpFolder == ''){
        data.append("tmp_folder", state.new_tmp_folder)
      }else{
        data.append("tmp_folder", state.selectedTmpFolder)
      }
      await axios.post(backend_base_uri + '/upload_file', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then(async response => {
        const serverFolder = await axios.get(backend_base_uri + '/folders');
        let folder:string[] = await serverFolder.data['folders'];
        let tmp:string[] = []
        if(response.data['files']){
          response.data['files'].map((elem:string) => {
            if(!elem.startsWith('.')){
              tmp.push(elem);
            }
          });
        }
        setState((prevState) => ({ ...prevState, 
          server_file_list: tmp, 
          tmp_folder_list: folder,
          tmpDropdownSelection: folder,
          new_tmp_check: false
        }));
      });
    }
    return 
  }

  const handleIndexDropdownChange = async (e:any) => {
    try{
      let value = e.currentTarget.value;
      setState((prevState) => ({ ...prevState ,selectedIndex: value}));
    }catch(error) {
      console.log("Error selecting index");
    }
  }

  const handleTmpDropdownChange = async (e:any) => {
    try{
      let value = e.currentTarget.value;
      setState((prevState) => ({ ...prevState ,selectedTmpFolder: value}));
    }catch(error) {
      console.log("Error selecting tmp folder");
    }
  }

  const handleDocumentIndexing = async () =>  {
    if(state.checkboxChecked){
      setState((prevState) => ({ ...prevState ,selectedIndex: state.new_index}));
    }
    if(state.selectedIndex){
      setState((prevState) =>({...prevState, index_request: true }))
      await axios.post(backend_base_uri + '/insert', {
        index: state.selectedIndex
      }).then(response => {
        setState((prevState) =>({...prevState, index_request: false }))
      }).catch(error => {
        console.log(error);
      });
    } 
  }

  function handleTextChangeIndex(e:any): void {
    setState((prevState) =>({...prevState, new_index: e.target.value }));
  }

  function handleTextChangeTmp(e:any): void {
    setState((prevState) =>({...prevState, new_tmp_folder: e.target.value }));
  }
  
  function handleTextChange(e:any): void {
    setState((prevState) =>({...prevState, query: e.target.value }));
  }

  const handleGenerateSubmit = async () => {
    setState((prevState) => ({...prevState, generate_spinner: true}));
    await axios.post(backend_base_uri + '/generate', {
      index: state.selectedIndex,
      query: state.query
    }).then(response => {
      setState((prevState) =>({...prevState, index_request: false, responseText: response.data.answer[0], generate_spinner: false }))
    }).catch(error => {
      console.log(error);
    });
  }

  async function handleDeleteFileFromServer(item: string, index: number) {
    await axios.post(backend_base_uri + '/removeFile', {
      filename: item
    }).then(async response => {
      if(await response.data['action'] == 'removed'){
        let tmpFiles: string[] = [];  
        state.server_file_list.forEach(elem => {
          if(elem !== item){
            tmpFiles.push(elem);
          }
        });
        setState((prevState) =>({...prevState, server_file_list: tmpFiles}));
      }
    }).catch(error => {
      console.log(error);
    });
  }

  return (
    <Container>
      <Row>
        <Col>
          <h3>Index auswählen</h3>
          <Form.Select disabled={state.checkboxChecked} onChange={e => {handleIndexDropdownChange(e)}}>
            {state.dropdownSelection.map(elem =>(
              <option key={elem} id={elem}>
                {elem}
              </option>
            ))}
          </Form.Select>
          <br/>

          <Form.Check 
            type="checkbox" 
            label="Neuer Index" 
            checked={state.checkboxChecked} 
            onChange={(e) => handleInputChange('checkboxChecked', e.target.checked)} 
          />
          <br/>
          <Form.Control 
            type="text" 
            placeholder="Neuer Index: name_bezeichnung" 
            disabled={!state.checkboxChecked}
            onChange={(e) => handleTextChangeIndex(e)}
          />
        </Col>
        <Col>
          <h2>Erklärungen</h2>
          <p>Index Management:</p>
          <p>
            In Indizies werden die Informationen aus den Dokumenten als Vektoren gespeichert und bei Anfragen entsprechend herausgesucht.
            Für die Beantwortung der Fragen ist es wesentlich, dass die richtigen Informationen gefunden werden.
          </p>
          <p>
            Bitte legt Indizies immer mit dem Schema <strong>name_bezeichnung</strong> an.
          </p>
          <p>
            Verwendet ohne Absprache nicht andere Indizies. 
          </p>
          <p>
            Sollte ein Index entfernt werden sollen, gebt bitte eine Information an julien.rudolph@cducsu.de
            
            Es ist derzeit leider nicht möglich Daten aus einem Index zu entfernen, da die hinzugefügten Daten nicht mehr anhand des Originaldokumentes identifiziert werden können.
          </p>
        </Col>
      </Row>
      <hr/>
      <Row>
        <Col>
        <h3>Temp Verzeichnis</h3>
        <Form.Select disabled={state.new_tmp_check} onChange={e => {handleTmpDropdownChange(e)}}>
            {state.tmpDropdownSelection.map(elem =>(
              <option key={elem} id={elem}>
                {elem}
              </option>
            ))}
          </Form.Select>
          <br/>

          <Form.Check 
            type="checkbox" 
            label="Neuer Uploadordner" 
            checked={state.new_tmp_check} 
            onChange={(e) => handleInputChange('new_tmp_check', e.target.checked)} 
          />
          <br/>
          <Form.Control 
            type="text" 
            placeholder="Neues temp Verzeichnis" 
            disabled={!state.new_tmp_check}
            onChange={(e) => handleTextChangeTmp(e)}
          />
          <br/>
          <h3>Dateien hochladen</h3>
          
          <Form.Control 
            type="file" 
            onChange={(e) => handleInputChange('file', e.target.files ? e.target.files[0] : null)} 
          />
          <Button style={{marginTop: '5px'}} onClick={() => handleSubmitFile()}>Datei hochladen</Button>

          <h3>Dateien</h3>
              {state.server_file_list.map((item, index) => (
                  <div key={index}>
                    {item} 
                    <Button key={item + "_" + index} onClick={(e) => handleDeleteFileFromServer(item, index)}>Löschen</Button>
                  </div>
              ))}
        </Col>
        <Col>
          <p>
            Es handelt sich hierbei um ein <strong>Proof of Concept</strong>. Es gibt keine Trennung zwischen Benutzern.
            Die Trennung erfolgt ausschließlich per Index. 
            <br/>
            </p>
            Folgen:
            <ul>
            <li>Jeder andere kann die eigens angelegten Indizies ebenfalls nutzen. </li>
            <li>Vertrauliche oder private Daten sollten <strong>auf keinen Fall</strong>verwendet werden.</li>
            <li>Ich bitte eigenverantwortlich und kollegial die Arbeiten der anderen nicht zu verändern.</li>
            </ul>
            
          
          <p>
            Im ersten Schritt können nur PDF Dateien verarbeitet werden. Bitte achtet auf die sich links befindliche Anzeige an Dateien.
            Es sollten nur <strong> eigene Dateien </strong>dem Index hinzugefügt werden. Ansonsten kann es zu fehlerhaften Antworten kommen.
          </p>
          <p>
            Dateien werden nach dem hinzufügen zum Index automatisch entfernt.
          </p>
          <p>
            Sollten Daten aus vorheriger Verwendung vorhanden sein, bitte ich diese zu löschen. 
          </p>
        </Col>
      </Row>
      <hr/>
      <Row>
        <Col>
          <h3>Dateien Indizieren</h3> 
          <Button onClick={handleDocumentIndexing}>Indizieren</Button>
          <Spinner animation="border" role="status" hidden={!state.index_request}>
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <br/>      
        </Col>
        <Col>
              <p>
                Die hochgeladenen Dateien werden durch ein LLM in einzelne Abschnitte zerlegt und als Embedding in den entsprechenden Index geschrieben.
              </p>
              <p>
                Als Modell wird derzeit verwendet: T-Systems-onsite/cross-en-de-roberta-sentence-transformer 
                <br/>
              <a href="https://huggingface.co/T-Systems-onsite/cross-en-de-roberta-sentence-transformer">Modellcard Huggingface</a>
              </p>
              Sind die Dateien verarbeitet werden Sie in den Index geschrieben und anschließend vom Server entfernt.
        </Col>
      </Row>
      <hr/>
      <Row>
        <Col>
          <Form.Control 
            type="text" 
            id="query_input"
            placeholder="Frage eingeben"
            onChange={(e) => handleTextChange(e)}
          />
          <div>
            <Button style={{marginTop: '5px', marginBottom: '5px'}} onClick={() => handleGenerateSubmit()}>Query</Button>
            <Spinner animation="border" role="status" hidden={!state.generate_spinner}>
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
          <Form.Control 
            as="textarea" 
            rows={3} 
            placeholder="Response Textarea" 
            value={state.responseText} 
            onChange={(e) => handleInputChange('responseText', e.target.value)} 
          />
        </Col>
        <Col>
        <p>
          Die Eingabefrage wird als Referenz für die Vektorsuche sowie als Frage an das LLM verwendet. 
        </p>
        <p>
          Die Frage wird vom gleichen Modell, wie bei der Indizierung, in Embeddings transformiert.
          Anschließend wird durch die Pipeline eine entsprechende Ähnlichkeitssuche auf Basis der gebildeten Embeddings gegen die Vektordatenbank durchgeführt. 
        </p>
        <p>
          Die Suchparameter sowie der Ähnlichkeitsalgorithmus sind fest programmiert. Es werden die 4 passendsten Antworten verwendet um die Frage zu beantworten.
        </p>
        <p> 
          Die mit der Suche gefundenen Textfragmente werden zusammen mit der Frage und einem Template an das genutzte LLM weitergereicht. 
          Das LLM ist auf niedrige Temperatur konfiguriert. Weiterhin wird innerhalb des Templates festgelegt dass das Modell auf Deutsch sowie nur auf Basis der bereitgestellten
          Informationen antworten soll. 
        </p>
        <p>
          Aktuell verwendetes LLM: deepseek-r1:8B (llama3.2:2b )

          Es wird folgendes Template üfr die Userquery verwendet. Das Template zielt darauf ab das Modell korrekt zu instruieren.

          Das Modell wird aktielle mit einer Temperatur <a href="https://www.iguazio.com/glossary/llm-temperature/">(Temperatur)</a> von 0,1 betrieben, dies soll dazu führen dass das Modell sich bei Antworten möglichst wenig kreativ zeigt und somit die eingehenden Informationen darstellt. 
          <a href="https://huggingface.co/deepseek-ai/DeepSeek-R1">Huggingface Modellcard</a>
        </p>
        </Col>
      </Row>  
  </Container>
  );
};

export default App;
